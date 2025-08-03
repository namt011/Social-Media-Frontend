import axiosInstance from "../service/axiosInstance";
import { format } from 'date-fns';

const BASE_URL = 'http://localhost:8080/api/admin';

const userService = {
  getAllUsers: async (search = '', page = 0, size = 5, sortBy = 'userID') => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/users`, {
        params: { search, page, size, sortBy }
      });
      return {
        data: response.data.content,
        total: response.data.totalElements,
        currentPage: response.data.number,
        pageSize: response.data.size,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      throw error;
    }
  },

  getUserDetails: async (userId) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserReports: async (userId, page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/reports/users/${userId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUsersWithReportCounts: async (page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/reports/users`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  banUser: async (userId, until) => {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/users/${userId}/ban`, null, {
        params: { 
          until: format(new Date(until), "yyyy-MM-dd'T'HH:mm:ss") 
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  unbanUser: async (userId) => {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/users/${userId}/unban`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;