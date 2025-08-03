import axiosInstance from "./axiosInstance";

const REST_API_URL = "/api/messages";

// Message APIs
export const sendMessage = async (messageData) => {
  return await axiosInstance.post(REST_API_URL, messageData);
};

export const getConversationMessages = async (conversationId, page = 0, size = 20) => {
  return await axiosInstance.get(`${REST_API_URL}/conversation/${conversationId}`, {
    params: { page, size }
  });
};

export const markMessageAsRead = async (messageId) => {
  return await axiosInstance.put(`${REST_API_URL}/${messageId}/read`);
};

export const deleteMessage = async (messageId) => {
  return await axiosInstance.delete(`${REST_API_URL}/${messageId}`);
};

export const uploadAttachment = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await axiosInstance.post(`${REST_API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
};

// Conversation APIs
const CONVERSATION_URL = "/api/conversations";

export const getConversations = async (page = 0, size = 20) => {
  return await axiosInstance.get(CONVERSATION_URL, {
    params: { page, size }
  });
};

export const createConversation = async (conversationData) => {
  return await axiosInstance.post(CONVERSATION_URL, conversationData);
};

export const getConversationDetails = async (conversationId) => {
  return await axiosInstance.get(`${CONVERSATION_URL}/${conversationId}`);
};

export const addParticipants = async (conversationId, userIds) => {
  return await axiosInstance.post(`${CONVERSATION_URL}/${conversationId}/participants`, { userIds });
};

export const removeParticipant = async (conversationId, userId) => {
  return await axiosInstance.delete(`${CONVERSATION_URL}/${conversationId}/participants/${userId}`);
};
