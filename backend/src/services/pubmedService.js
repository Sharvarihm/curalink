const axios = require('axios');
const xml2js = require('xml2js');

const BASE_SEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const BASE_FETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';

async function fetchPubMed(query, maxResults = 80) {
  try {
    const searchRes = await axios.get(BASE_SEARCH, {
      params: {
        db: 'pubmed',
        term: query,
        retmax: maxResults,
        sort: 'pub date',
        retmode: 'json',
        api_key: process.env.NCBI_API_KEY
      }
    });

    const ids = searchRes.data.esearchresult.idlist;
    if (!ids || !ids.length) return [];

    console.log(`PubMed: found ${ids.length} IDs`);

    const fetchRes = await axios.get(BASE_FETCH, {
      params: {
        db: 'pubmed',
        id: ids.join(','),
        retmode: 'xml',
        api_key: process.env.NCBI_API_KEY
      }
    });

    const parser = new xml2js.Parser();
    const parsed = await parser.parseStringPromise(fetchRes.data);
    const articles = parsed.PubmedArticleSet?.PubmedArticle || [];

    return articles.map(article => {
      const medline = article.MedlineCitation[0];
      const articleData = medline.Article[0];
      const pmid = medline.PMID[0]._ || medline.PMID[0];

      return {
        title: Array.isArray(articleData.ArticleTitle)
          ? articleData.ArticleTitle[0]
          : articleData.ArticleTitle || 'No title',
        abstract: articleData.Abstract?.[0]?.AbstractText?.[0]?._ ||
                  articleData.Abstract?.[0]?.AbstractText?.[0] ||
                  'No abstract available',
        authors: (articleData.AuthorList?.[0]?.Author || [])
          .slice(0, 3)
          .map(a => `${a.LastName?.[0] || ''} ${a.ForeName?.[0] || ''}`.trim())
          .filter(Boolean),
        year: medline.DateCompleted?.[0]?.Year?.[0] ||
              articleData.Journal?.[0]?.JournalIssue?.[0]?.PubDate?.[0]?.Year?.[0] ||
              'Unknown',
        source: 'PubMed',
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        pmid: pmid
      };
    });

  } catch (error) {
    console.error('PubMed fetch error:', error.message);
    return [];
  }
}

module.exports = { fetchPubMed };