function buildResearchPrompt(userQuery, disease, publications, clinicalTrials, conversationHistory, extractedInfo) {

  const historyText = conversationHistory
    .slice(-10)
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');

  // Format pre-extracted info if available
  const extractedSection = extractedInfo ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRE-ANALYZED: MOST RELEVANT INFORMATION FOR "${userQuery}"
(Already extracted from abstracts — use this to build your response)

DIRECT ANSWER POINTS:
${extractedInfo.directAnswerPoints?.map(p => 
  `• ${p.point} [${p.source}] (${p.year})`
).join('\n') || 'None extracted'}

KEY FINDINGS WITH DATA:
${extractedInfo.keyFindings?.map(f => 
  `• ${f.finding} — ${f.detail} [${f.source}]`
).join('\n') || 'None extracted'}

MOST RELEVANT TRIALS:
${extractedInfo.relevantTrials?.map(t => 
  `• [${t.trialRef}] ${t.relevance} — ${t.keyDetail}`
).join('\n') || 'None extracted'}

KEY AUTHORS/RESEARCHERS:
${extractedInfo.authorContributions?.map(a => 
  `• ${a.authors} [${a.source}]: ${a.contribution}`
).join('\n') || 'None extracted'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━` : '';

  // Full publications
  const pubsText = publications.map((p, i) =>
    `[PUB${i+1}]
Title: ${p.title}
Authors: ${Array.isArray(p.authors) ? p.authors.join(', ') : p.authors || 'Unknown'}
Year: ${p.year} | Source: ${p.source}
Abstract: ${p.abstract?.slice(0, 700)}
URL: ${p.url}`
  ).join('\n\n');

  // Full trials
  const trialsText = clinicalTrials.length > 0
    ? clinicalTrials.map((t, i) =>
        `[TRIAL${i+1}]
Title: ${t.title}
Status: ${t.status} | Phase: ${t.phase}
Eligibility: ${t.eligibility?.criteria?.slice(0, 500) || 'Not specified'}
Age: ${t.eligibility?.minAge || 'Any'} to ${t.eligibility?.maxAge || 'Any'} | Sex: ${t.eligibility?.sex || 'All'}
Locations: ${t.locations?.map(l => [l.facility, l.city, l.country].filter(Boolean).join(', ')).join(' | ') || 'Not specified'}
Contact: ${t.contact?.name || ''} ${t.contact?.email || ''}
URL: ${t.url}`
      ).join('\n\n')
    : `No trials returned. Search: https://clinicaltrials.gov/search?cond=${encodeURIComponent(disease)}`;

  return `You are Curalink — an expert AI medical research companion for ${disease} patients.

CONVERSATION HISTORY:
${historyText || 'New conversation.'}

PATIENT QUESTION: "${userQuery}"
DISEASE CONTEXT: ${disease}

${extractedSection}

FULL PUBLICATIONS (${publications.length} papers):
${pubsText}

CLINICAL TRIALS (${clinicalTrials.length} trials):
${trialsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR TASK:
Answer "${userQuery}" using the pre-analyzed information and full abstracts above.

The pre-analyzed section already extracted the most relevant sentences for you.
Use those points as the foundation of your answer.
Add more detail from the full abstracts where needed.

STRICT RULES:
1. Use ONLY data from the research above — not your own training knowledge
2. Cite every fact: [PUBx] for publications, [TRIALx] for trials
3. Be specific — real drug names, real percentages, real outcomes from abstracts
4. Answer EXACTLY what was asked — if symptoms, give symptoms; if treatment, give treatments
5. If this is a follow-up question, use conversation history context
6. Never give generic answers — every point must trace back to a specific paper

RESPOND IN THIS EXACT FORMAT:

## 🔬 Overview
[2-3 sentences directly answering "${userQuery}" using specific data from the pre-analyzed section above. Name actual findings, drugs, or symptoms from the research — not generic statements.]

## 📚 Research Findings
[5-6 bullet points using the pre-extracted findings and full abstracts]
- **[Specific Title]**: [Exact finding with drug names/numbers/outcomes from abstract] [PUBx]

## 🏥 Clinical Trials
${clinicalTrials.length > 0
  ? clinicalTrials.slice(0, 6).map((t, i) =>
    `• **[TRIAL${i+1}] ${t.title}**
  - Status: ${t.status} | Phase: ${t.phase}
  - Who can join: [plain language summary of eligibility]
  - Where: ${t.locations?.map(l => [l.city, l.country].filter(Boolean).join(', ')).slice(0,2).join(' | ') || 'Multiple locations'}
  - What it tests: [1 sentence from trial data]
  - Link: ${t.url}`
    ).join('\n\n')
  : `No trials returned for this query. Search directly: https://clinicaltrials.gov/search?cond=${encodeURIComponent(disease)}`
}

## 💡 Personalized Insight
[3-4 sentences for a ${disease} patient asking "${userQuery}".
Use specific study results [PUBx] — actual drug names, survival rates, response rates.
Be actionable and specific — not generic advice.]

## 📋 Source Attribution
| # | Title | Authors | Year | Platform | URL | Supporting Evidence |
|---|-------|---------|------|----------|-----|---------------------|
[One row per cited source. Supporting Evidence must be an actual quote or finding from that paper.]

## ⚠️ Medical Disclaimer
This is for research and educational purposes only. Always consult a qualified healthcare professional.`;
}

module.exports = { buildResearchPrompt };