import { create } from 'zustand';
import { sendMessage, getSessionId } from '../services/api';

const useChatStore = create((set, get) => ({
  // State
  messages: [],
  publications: [],
  clinicalTrials: [],
  isLoading: false,
  error: null,
  sessionId: getSessionId(),
  userContext: {
    patientName: '',
    disease: '',
    location: ''
  },
  isContextSet: false,
  metadata: null,

  // Actions
  setUserContext: (context) => set({ 
    userContext: context, 
    isContextSet: true 
  }),

  clearError: () => set({ error: null }),

  resetChat: () => {
    localStorage.removeItem('curalink_session');
    set({
      messages: [],
      publications: [],
      clinicalTrials: [],
      sessionId: getSessionId(),
      isContextSet: false,
      userContext: { patientName: '', disease: '', location: '' },
      metadata: null
    });
  },

  sendMessage: async (message) => {
    const { userContext } = get();

    // Add user message immediately
    set(state => ({
      messages: [...state.messages, {
        role: 'user',
        content: message,
        timestamp: new Date()
      }],
      isLoading: true,
      error: null
    }));

    try {
      const data = await sendMessage(message, userContext);

      set(state => ({
        messages: [...state.messages, {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          publications: data.publications,
          clinicalTrials: data.clinicalTrials
        }],
        publications: data.publications || [],
        clinicalTrials: data.clinicalTrials || [],
        metadata: data.metadata,
        isLoading: false
      }));

    } catch (error) {
      set(state => ({
        messages: [...state.messages, {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
          isError: true
        }],
        isLoading: false,
        error: error.message
      }));
    }
  }
}));

export default useChatStore;