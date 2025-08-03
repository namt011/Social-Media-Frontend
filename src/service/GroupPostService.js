
import axiosInstance from './axiosInstance';
const BASE_URL = '/api/groups';

const POST_API_URL = '/api/feed/groups';

const groupPostService = {
  // Get group posts
  getGroupPosts: async (groupId, page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${groupId}/posts?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create post in group
  createPost: async (groupId, postData) => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/${groupId}/posts`, postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update post
  updatePost: async (groupId, postId, postData) => {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${groupId}/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete post
  deletePost: async (groupId, postId) => {
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/${groupId}/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

    // Get posts from joined groups
    getJoinedGroupsPosts: async (page = 0, size = 10) => {
        try {
          const response = await axiosInstance.get(`${POST_API_URL}/joined/posts?page=${page}&size=${size}`);
          return response.data;
        } catch (error) {
          throw error;
        }
      },
    
      // Get posts from public groups
      getPublicGroupsPosts: async (page = 0, size = 10) => {
        try {
          const response = await axiosInstance.get(`${POST_API_URL}/public/posts?page=${page}&size=${size}`);
          return response.data;
        } catch (error) {
          throw error;
        }
      }

  
};

export default groupPostService;