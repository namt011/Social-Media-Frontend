// src/services/api/searchService.js
import axiosInstance from "../service/axiosInstance";

const API_BASE_URL = 'http://localhost:8080/api'; // Thay đổi theo config của bạn

export const searchUsers = async (query, page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/users/search/name`, {
      params: { query, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const searchPosts = async (query, page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/posts/search`, {
      params: { query, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};

export const searchGroups = async (keyword, page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/groups/search`, {
      params: { keyword, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching groups:', error);
    throw error;
  }
};