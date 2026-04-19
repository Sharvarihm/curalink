const axios = require('axios');

const PROVIDERS = [
  {
    name: 'Llama3.3-70B',
    url: 'https://router.huggingface.co/novita/v3/openai/chat/completions',
    model: 'meta-llama/llama-3.3-70b-instruct',
  },
  {
    name: 'Llama3.1-8B (fallback)',
    url: 'https://router.huggingface.co/novita/v3/openai/chat/completions',
    model: 'meta-llama/llama-3.1-8b-instruct',
  }
];

// Stage 1 — Extract relevant info from abstracts for ANY question
async function extractRelevantInfo(userQuery, disease, publications, clinicalTrials) {
  try {
    const pubSummaries = publications.map((p, i) =>
      `[PUB${i+1}] "${p.title}" (${p.year}, ${p.source})
Abstract: ${p.abstract?.slice(0, 800) || 'No abstract'}
Authors: ${Array.isArray(p.authors) ? p.authors.join(', ') : p.authors || 'Unknown'}
URL: ${p.url}`
    ).join('\n\n');

    const trialSummaries = clinicalTrials.map((t, i) =>
      `[TRIAL${i+1}] "${t.title}"
Status: ${t.status} | Phase: ${t.phase}
Eligibility: ${t.eligibility?.criteria?.slice(0, 400) || 'Not specified'}
Locations: ${t.locations?.map(l => [l.city, l.country].filter(Boolean).join(', ')).join(' | ') || 'Not specified'}
URL: ${t.url}`
    ).join('\n\n');

    const extractPrompt = `You are a medical research analyst. 

A patient with ${disease} asked: "${userQuery}"

Read ALL the abstracts below and extract ONLY the information that directly answers this question.
Extract exact sentences and data points from the abstracts — do not paraphrase, copy the relevant parts.

PUBLICATIONS:
${pubSummaries}

CLINICAL TRIALS:
${trialSummaries}

Extract and organize the most relevant information from above that answers "${userQuery}".
Return a JSON object with this structure:
{
  "directAnswerPoints": [
    {"point": "exact relevant sentence or finding from abstract", "source": "PUB1", "year": "2024"}
  ],
  "keyFindings": [
    {"finding": "specific finding with data/numbers/drug names", "source": "PUB2", "detail": "additional context"}
  ],
  "relevantTrials": [
    {"trialRef": "TRIAL1", "relevance": "why this trial is relevant to the question", "keyDetail": "what it tests"}
  ],
  "authorContributions": [
    {"authors": "names", "source": "PUB1", "contribution": "what they researched"}
  ]
}

Return ONLY valid JSON. No other text.`;

    const response = await axios.post(
      PROVIDERS[0].url,
      {
        model: PROVIDERS[0].model,
        messages: [
          { role: 'system', content: 'You are a medical research analyst. Extract exact information from abstracts. Return only valid JSON.' },
          { role: 'user', content: extractPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.1
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const text = response.data.choices[0].message.content.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      console.log('✅ Stage 1 extraction complete');
      console.log(`  Direct answer points: ${extracted.directAnswerPoints?.length || 0}`);
      console.log(`  Key findings: ${extracted.keyFindings?.length || 0}`);
      console.log(`  Relevant trials: ${extracted.relevantTrials?.length || 0}`);
      return extracted;
    }
    throw new Error('No valid JSON in extraction response');

  } catch (error) {
    console.error('Stage 1 extraction failed:', error.message);
    return null;
  }
}

// Stage 2 — Generate final response using extracted info
async function callLLM(prompt) {
  for (const provider of PROVIDERS) {
    try {
      console.log(`Trying ${provider.name}...`);
      const response = await axios.post(
        provider.url,
        {
          model: provider.model,
          messages: [
            {
              role: 'system',
              content: `You are Curalink, an expert AI medical research companion. 
You provide accurate, specific, research-backed responses.
You ONLY use the research data provided — never your own training knowledge.
Every claim must be cited with [PUBx] or [TRIALx].
You are specific, detailed, and directly answer what was asked.`
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.2
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 90000
        }
      );

      const result = response.data.choices[0].message.content;
      console.log(`✅ LLM response from ${provider.name}`);
      return result;

    } catch (error) {
      console.error(`❌ ${provider.name} failed:`, error.response?.data?.error || error.message);
      continue;
    }
  }
  throw new Error('All LLM providers failed');
}

module.exports = { callLLM, extractRelevantInfo };