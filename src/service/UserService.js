import axiosInstance from "./axiosInstance";

const REST_API_URL = "/api/users";
export const GetAllUsers = async () => {
  return await axiosInstance.get(REST_API_URL);
}

export const GetUserById = async (userID)  => {
  return await axiosInstance.get(`${REST_API_URL}/${userID}`);
}

export const UpdateUser = async (userData,userID) => {
  return await axiosInstance.put(`${REST_API_URL}/${userID}`, userData);
}