const { expandQuery } = require('../services/queryExpansion');
const { fetchPubMed } = require('../services/pubmedService');
const { fetchOpenAlex } = require('../services/openAlexService');
const { fetchClinicalTrials } = require('../services/clinicalTrialsService');
const { rankPublications, rankClinicalTrials } = require('../services/rankingService');
const { buildResearchPrompt } = require('../utils/promptBuilder');
const { callLLM, extractRelevantInfo } = require('../services/llmService');
const Conversation = require('../models/conversation');
const { v4: uuidv4 } = require('uuid');

async function handleChat(req, res) {
  try {
    const { message, sessionId, userContext } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    console.log('\n========== NEW REQUEST ==========');
    console.log('Message:', message);
    console.log('SessionId:', sessionId);

    // 1. Get or create conversation
    let conversation = await Conversation.findOne({ sessionId });
    if (!conversation) {
      conversation = new Conversation({
        sessionId: sessionId || uuidv4(),
        userContext: userContext || {},
        messages: []
      });
      console.log('New conversation created');
    } else {
      console.log('Existing conversation, messages:', conversation.messages.length);
    }

    // 2. Update context
    if (userContext?.disease) {
      conversation.userContext = {
        ...(conversation.userContext.toObject?.() || conversation.userContext),
        ...userContext
      };
    }

    const disease = conversation.userContext?.disease || 'general medicine';
    const location = conversation.userContext?.location || '';
    console.log('Disease:', disease);

    // 3. Expand query
    console.log('\n[1/5] Expanding query...');
    const queries = await expandQuery(disease, message);
    console.log('Expanded:', queries.primary);

    // 4. Fetch from all 3 sources in parallel
    console.log('\n[2/5] Fetching from 3 sources in parallel...');
    const [pubmedResults, openAlexResults, trialResults] = await Promise.all([
      fetchPubMed(queries.pubmed, 80),
      fetchOpenAlex(queries.openAlex, 100),
      fetchClinicalTrials(queries.clinicalTrials || disease, message, location, 50)
    ]);

    console.log(`PubMed: ${pubmedResults.length} | OpenAlex: ${openAlexResults.length} | Trials: ${trialResults.length}`);

    // 5. Rank
    console.log('\n[3/5] Ranking...');
    const allPublications = [...pubmedResults, ...openAlexResults];
    const rankedPublications = rankPublications(allPublications, message, disease);
    const rankedTrials = rankClinicalTrials(trialResults, disease, message);
    console.log(`Ranked: ${rankedPublications.length} publications, ${rankedTrials.length} trials`);

    // 6. Stage 1 — Extract relevant info using LLM
    console.log('\n[4/5] Stage 1: Extracting relevant info from abstracts...');
    const extractedInfo = await extractRelevantInfo(
      message,
      disease,
      rankedPublications,
      rankedTrials
    );

    // 7. Build prompt with extracted info
    const prompt = buildResearchPrompt(
      message,
      disease,
      rankedPublications,
      rankedTrials,
      conversation.messages,
      extractedInfo  // pass extracted info
    );

    // 8. Stage 2 — Generate final response
    console.log('\n[5/5] Stage 2: Generating final response...');
    const llmResponse = await callLLM(prompt);
    console.log('Response length:', llmResponse.length);

    // 9. Save to MongoDB
    conversation.messages.push({ role: 'user', content: message });
    conversation.messages.push({
      role: 'assistant',
      content: llmResponse,
      publications: rankedPublications,
      clinicalTrials: rankedTrials
    });
    await conversation.save();
    console.log('Saved to MongoDB ✅');

    // 10. Return
    res.json({
      success: true,
      sessionId: conversation.sessionId,
      response: llmResponse,
      publications: rankedPublications,
      clinicalTrials: rankedTrials,
      metadata: {
        totalFetched: allPublications.length + trialResults.length,
        afterRanking: rankedPublications.length + rankedTrials.length,
        disease,
        expandedQuery: queries.primary,
        sources: {
          pubmed: pubmedResults.length,
          openAlex: openAlexResults.length,
          clinicalTrials: trialResults.length
        }
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { handleChat };