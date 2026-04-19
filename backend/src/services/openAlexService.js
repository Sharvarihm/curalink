const axios = require('axios');

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex) return 'No abstract available';
  try {
    const words = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      positions.forEach(pos => { words[pos] = word; });
    }
    return words.join(' ');
  } catch {
    return 'No abstract available';
  }
}

async function fetchOpenAlex(query, maxResults = 100) {
  try {
    let allResults = [];
    const perPage = 50;
    const pages = Math.ceil(maxResults / perPage);

    for (let page = 1; page <= pages; page++) {
      const res = await axios.get('https://api.openalex.org/works', {
        params: {
          search: query,
          'per-page': perPage,
          page,
          sort: 'relevance_score:desc',
          filter: 'from_publication_date:2018-01-01'
        },
        headers: {
          'User-Agent': 'Curalink/1.0 (medical research assistant; contact@curalink.com)'
        }
      });

      const results = res.data.results || [];
      allResults = [...allResults, ...results];
      if (results.length < perPage) break;
    }

    console.log(`OpenAlex: found ${allResults.length} results`);

    return allResults.map(work => ({
      title: work.title || 'No title',
      abstract: reconstructAbstract(work.abstract_inverted_index),
      authors: (work.authorships || [])
        .slice(0, 3)
        .map(a => a.author?.display_name || 'Unknown'),
      year: work.publication_year,
      source: 'OpenAlex',
      url: work.primary_location?.landing_page_url || work.id,
      citationCount: work.cited_by_count || 0
    }));

  } catch (error) {
    console.error('OpenAlex fetch error:', error.message);
    return [];
  }
}

module.exports = { fetchOpenAlex };