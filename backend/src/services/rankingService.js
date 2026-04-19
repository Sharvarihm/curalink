const { distance } = require('fastest-levenshtein');

// ─── Sanitize any value to a clean string ───────────────────────────────────
function sanitizeText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.join(' ');
  if (typeof val === 'object') {
    // Handle PubMed XML objects like { _: "actual text", $: {...} }
    if (val._) return val._;
    return JSON.stringify(val);
  }
  return String(val);
}

// ─── Check if two titles are duplicates ─────────────────────────────────────
function areSimilarTitles(title1, title2) {
  const t1 = title1.toLowerCase().trim().replace(/[.,;:!?]$/g, '');
  const t2 = title2.toLowerCase().trim().replace(/[.,;:!?]$/g, '');

  // Exact match after cleanup
  if (t1 === t2) return true;

  // One contains the other (handles truncated titles)
  if (t1.length > 20 && t2.length > 20) {
    if (t1.includes(t2) || t2.includes(t1)) return true;
  }

  // Levenshtein similarity — 90% similar = duplicate
  const maxLen = Math.max(t1.length, t2.length);
  if (maxLen === 0) return true;
  const dist = distance(t1, t2);
  const similarity = 1 - dist / maxLen;

  return similarity > 0.90;
}

// ─── Remove duplicate publications ──────────────────────────────────────────
function deduplicatePublications(publications) {
  const unique = [];

  for (const pub of publications) {
    const title = sanitizeText(pub.title).toLowerCase().trim();
    if (!title || title === 'no title') continue;

    const isDuplicate = unique.some(u =>
      areSimilarTitles(sanitizeText(u.title), title)
    );

    if (!isDuplicate) {
      unique.push(pub);
    }
  }

  console.log(`Dedup: ${publications.length} → ${unique.length} unique publications`);
  return unique;
}

// ─── Rank Publications ───────────────────────────────────────────────────────
function rankPublications(publications, query, disease) {

  // Step 1: Deduplicate first
  const deduplicated = deduplicatePublications(publications);

  // Step 2: Build query word list for scoring
  const queryWords = `${query} ${disease}`
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3)
    .map(w => w.replace(/[^a-z0-9]/g, ''));

  const currentYear = new Date().getFullYear();

  // Step 3: Score each publication
  const scored = deduplicated.map(pub => {
    let score = 0;

    const title    = sanitizeText(pub.title).toLowerCase();
    const abstract = sanitizeText(pub.abstract).toLowerCase();
    const authors  = Array.isArray(pub.authors)
      ? pub.authors.join(' ').toLowerCase()
      : sanitizeText(pub.authors).toLowerCase();
    const fullText = `${title} ${abstract} ${authors}`;

    // ── Relevance scoring ──────────────────────────────────────
    queryWords.forEach(word => {
      if (fullText.includes(word)) score += 3;  // anywhere in text
      if (title.includes(word))    score += 5;  // title match = stronger
    });

    // ── Recency scoring ────────────────────────────────────────
    const pubYear = parseInt(pub.year) || 2000;
    const age = currentYear - pubYear;
    if (age <= 1)      score += 15;
    else if (age <= 2) score += 12;
    else if (age <= 3) score += 9;
    else if (age <= 5) score += 6;
    else if (age <= 8) score += 3;
    // older than 8 years → no recency boost

    // ── Citation count boost (OpenAlex only) ──────────────────
    if (pub.citationCount && pub.citationCount > 0) {
      // log scale so 1000 citations doesn't dominate over relevance
      score += Math.min(Math.floor(Math.log10(pub.citationCount + 1) * 3), 8);
    }

    // ── Source credibility ─────────────────────────────────────
    if (pub.source === 'PubMed')    score += 5;
    if (pub.source === 'OpenAlex')  score += 3;

    // ── Data quality penalties ─────────────────────────────────
    const hasAbstract = pub.abstract &&
      pub.abstract !== 'No abstract available' &&
      pub.abstract.length > 50;
    if (!hasAbstract) score -= 8;

    const hasAuthors = pub.authors &&
      (Array.isArray(pub.authors) ? pub.authors.length > 0 : pub.authors.length > 0);
    if (!hasAuthors) score -= 3;

    if (!pub.url || pub.url === '') score -= 2;

    return {
      ...pub,
      title:          sanitizeText(pub.title),
      abstract:       sanitizeText(pub.abstract),
      relevanceScore: Math.max(0, score)
    };
  });

  // Step 4: Sort by score and return top 12
  const ranked = scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 12);

  console.log(`Publications: ${deduplicated.length} → top ${ranked.length} after ranking`);
  console.log('Top 3 scores:', ranked.slice(0, 3).map(p => ({
    title: p.title?.slice(0, 50),
    score: p.relevanceScore
  })));

  return ranked;
}

// ─── Rank Clinical Trials ────────────────────────────────────────────────────
function rankClinicalTrials(trials, disease, query) {

  const queryWords = `${query} ${disease}`
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3)
    .map(w => w.replace(/[^a-z0-9]/g, ''));

  // Status priority — most actionable first
  const statusPriority = {
    'RECRUITING':               15,
    'ACTIVE_NOT_RECRUITING':    10,
    'ENROLLING_BY_INVITATION':   8,
    'COMPLETED':                 5,
    'TERMINATED':                1,
    'WITHDRAWN':                 0,
  };

  // Phase priority — more advanced = more validated
  const phasePriority = {
    'PHASE4': 6,
    'PHASE3': 5,
    'PHASE2': 3,
    'PHASE1': 1,
  };

  // Deduplicate by nctId
  const seen = new Set();
  const unique = trials.filter(trial => {
    if (!trial.nctId || seen.has(trial.nctId)) return false;
    seen.add(trial.nctId);
    return true;
  });

  const scored = unique.map(trial => {
    let score = statusPriority[trial.status] || 0;

    const title    = sanitizeText(trial.title).toLowerCase();
    const criteria = sanitizeText(trial.eligibility?.criteria).toLowerCase();
    const fullText = `${title} ${criteria}`;

    // ── Relevance scoring ──────────────────────────────────────
    queryWords.forEach(word => {
      if (fullText.includes(word)) score += 3;
      if (title.includes(word))    score += 4; // title match stronger
    });

    // ── Phase scoring ──────────────────────────────────────────
    if (trial.phase) {
      const phaseUpper = trial.phase.toUpperCase().replace(/\s/g, '');
      for (const [phase, pts] of Object.entries(phasePriority)) {
        if (phaseUpper.includes(phase)) {
          score += pts;
          break;
        }
      }
    }

    // ── Has contact info boost ─────────────────────────────────
    if (trial.contact) score += 2;

    // ── Has location info boost ────────────────────────────────
    if (trial.locations && trial.locations.length > 0) score += 2;

    return { ...trial, priorityScore: score };
  });

  const ranked = scored
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 8);

  console.log(`Trials: ${unique.length} → top ${ranked.length} after ranking`);

  return ranked;
}

module.exports = { rankPublications, rankClinicalTrials };