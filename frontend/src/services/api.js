import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generate or retrieve session ID
export const getSessionId = () => {
  let sessionId = localStorage.getItem('curalink_session');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('curalink_session', sessionId);
  }
  return sessionId;
};

export const sendMessage = async (message, userContext) => {
  const sessionId = getSessionId();
  const response = await axios.post(`${API_BASE}/chat`, {
    message,
    sessionId,
    userContext
  });
  return response.data;
};