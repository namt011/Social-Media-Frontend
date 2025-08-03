import axiosInstance from "./axiosInstance";

const BASE_URL = '/api/groups';

const groupService = {
  // Get public groups
  getPublicGroups: async (page = 0, size = 20) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/public?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSuggestedGroups: async (page = 0, size = 20) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/suggested?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's joined groups
  getUserGroups: async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/my-groups`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get group details
  getGroupById: async (groupId) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${groupId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Get group members
  getGroupMembers: async (groupId) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${groupId}/members`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new group
  createGroup: async (groupData) => {
    try {
      const response = await axiosInstance.post(BASE_URL, groupData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update group
  updateGroup: async (groupId, groupData) => {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Join group
  joinGroup: async (groupId) => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/${groupId}/join`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Leave group
  leaveGroup: async (groupId) => {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/${groupId}/leave`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //delete member 
  deleteMember: async (groupId, userId) => {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/${groupId}/members/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default groupService;