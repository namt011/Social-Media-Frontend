import axiosInstance from "../service/axiosInstance";

const API_URL = '/api/notifications';

export const getNotifications = async (page = 0, size = 10) => {
  const response = await axiosInstance.get(API_URL, {
    params: { page, size }
  });
  return response;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await axiosInstance.put(`${API_URL}/${notificationId}/read`);
  return response;
};

export const markAllNotificationsAsRead = async () => {
  const response = await axiosInstance.put(`${API_URL}/mark-all-read`);
  return response;
};

export const deleteNotification = async (notificationId) => {
  const response = await axiosInstance.delete(`${API_URL}/${notificationId}`);
  return response;
};

export const getCountUnreadNotifications = async () => {
  const response = await axiosInstance.get(`${API_URL}/unread-count`);
  return response;
}