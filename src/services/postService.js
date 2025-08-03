import axiosInstance from "../service/axiosInstance";

const API_URL = '/api/admin/posts';

export const postService = {
  getAllPosts: async (params) => {
    try {
      const response = await axiosInstance.get(API_URL, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      await axiosInstance.delete(`${API_URL}/${postId}`);
    } catch (error) {
      throw error;
    }
  },

  restorePost: async (postId) => {
    try {
      await axiosInstance.put(`${API_URL}/${postId}/restore`);
    } catch (error) {
      throw error;
    }
  }
};