import axiosInstance from "./axiosInstance";

const API_URL = "/api/friends";

export const sendFriendRequest = async (receiverId) => {
  return axiosInstance.post(
    `${API_URL}/request`,
    { receiverId }
  );
};

export const respondToFriendRequest = async (requestId, status) => {
  return axiosInstance.put(
    `${API_URL}/requests/${requestId}`, // Fixed endpoint
    { status }
  );
};

export const getFriendRequests = async (type) => {
  return axiosInstance.get(
    `${API_URL}/requests?type=${type}` // Fixed endpoint
  );
};

export const getFriends = async (userId) => {
  return axiosInstance.get(`${API_URL}?userId=${userId}`); // Fixed endpoint
};

export const deleteFriendRequest = async (requestId) => {
  return axiosInstance.delete(
    `${API_URL}/requests/${requestId}` // Fixed endpoint
  );
};

export const checkFriendshipStatus = async (userId) => {
  return axiosInstance.get(
    `${API_URL}/status/${userId}`
  );
};
