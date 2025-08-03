import axiosInstance from "../service/axiosInstance";

const API_URL = '/api/admin/groups';

const groupService = {
  getAllGroups: async ({ page, size, sort, direction, groupId }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (sort && direction) {
      params.append('sort', sort);
      params.append('direction', direction);
    }

    if (groupId) {
      params.append('groupId', groupId.toString());
    }

    const response = await axiosInstance.get(`${API_URL}?${params}`);
    return response.data;
  },

  createGroup: async (groupData) => {
    const response = await axiosInstance.post(API_URL, groupData);
    return response.data;
  },

  banGroup: async (groupId) => {
    const response = await axiosInstance.put(`${API_URL}/${groupId}/ban`);
    return response.data;
  },

  unbanGroup: async (groupId) => {
    const response = await axiosInstance.put(`${API_URL}/${groupId}/unban`);
    return response.data;
  },

  getGroupMembers: async (groupId, page = 0, size = 10, sortBy = 'joinedAt', direction = 'DESC') => {
    const response = await axiosInstance.get(`${API_URL}/${groupId}/members`, {
      params: { page, size, sortBy, direction }
    });
    return response.data;
  },

  getMemberCount: async (groupId) => {
    const response = await axiosInstance.get(`${API_URL}/${groupId}/members/count`);
    return response.data;
  },

  getReportCount: async (groupId) => {
    const response = await axiosInstance.get(`${API_URL}/${groupId}/reports/count`);
    return response.data;
  }
};

export default groupService;