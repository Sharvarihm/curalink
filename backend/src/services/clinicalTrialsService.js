const axios = require('axios');

async function fetchClinicalTrials(disease, query, location = '', maxResults = 50) {
  try {
    const res = await axios.get('https://clinicaltrials.gov/api/v2/studies', {
      params: {
        'query.cond': disease,
        'query.term': query,
        'filter.overallStatus': 'RECRUITING,ACTIVE_NOT_RECRUITING,COMPLETED',
        pageSize: maxResults,
        format: 'json'
      }
    });

    const studies = res.data.studies || [];
    console.log(`ClinicalTrials: found ${studies.length} studies`);

    return studies.map(study => {
      const proto = study.protocolSection;
      const id = proto.identificationModule;
      const status = proto.statusModule;
      const eligibility = proto.eligibilityModule;
      const contacts = proto.contactsLocationsModule;

      return {
        title: id?.briefTitle || 'No title',
        nctId: id?.nctId,
        status: status?.overallStatus,
        phase: proto.designModule?.phases?.join(', ') || 'N/A',
        eligibility: {
          criteria: eligibility?.eligibilityCriteria || 'Not specified',
          minAge: eligibility?.minimumAge || 'Any',
          maxAge: eligibility?.maximumAge || 'Any',
          sex: eligibility?.sex || 'All'
        },
        locations: (contacts?.locations || []).slice(0, 3).map(loc => ({
          facility: loc.facility,
          city: loc.city,
          country: loc.country
        })),
        contact: contacts?.centralContacts?.[0] || null,
        url: `https://clinicaltrials.gov/study/${id?.nctId}`,
        source: 'ClinicalTrials.gov'
      };
    });

  } catch (error) {
    console.error('ClinicalTrials fetch error:', error.message);
    return [];
  }
}

module.exports = { fetchClinicalTrials };