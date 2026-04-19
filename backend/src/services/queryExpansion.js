const axios = require('axios');

async function expandQuery(disease, userQuery) {
  try {
    const prompt = `You are a medical search expert. A user with "${disease}" asked: "${userQuery}"

Generate optimized search queries to find the most relevant medical research.

Respond with ONLY valid JSON, no other text:
{"primary":"best combined search query","pubmed":"pubmed query using AND/OR operators and medical terminology","openAlex":"openalex search query","clinicalTrials":"condition name only","relatedTerms":["term1","term2","term3"]}

Rules:
- Understand the INTENT (symptoms/treatment/trials/researchers/side effects/supplements)
- Always combine disease + intent in primary query
- Expand abbreviations to full medical terms
- Add relevant synonyms and related medical terms
- PubMed query must use AND/OR operators
- clinicalTrials field must be ONLY the condition name, nothing else`;

    const response = await axios.post(
      'https://router.huggingface.co/novita/v3/openai/chat/completions',
      {
        model: 'meta-llama/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250,
        temperature: 0.1
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const text = response.data.choices[0].message.content.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const expanded = JSON.parse(jsonMatch[0]);
      console.log('✅ Query expanded:', expanded.primary);
      return expanded;
    }
    throw new Error('No valid JSON in response');

  } catch (error) {
    console.error('Query expansion fallback used:', error.message);
    const combined = `${userQuery} ${disease}`.trim();
    return {
      primary: combined,
      pubmed: `(${disease}) AND (${userQuery}) AND (treatment OR symptoms OR diagnosis OR therapy OR clinical trial OR research)`,
      openAlex: combined,
      clinicalTrials: disease,
      relatedTerms: []
    };
  }
}

module.exports = { expandQuery };