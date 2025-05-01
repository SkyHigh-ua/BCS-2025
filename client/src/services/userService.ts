import axios from "axios";
import { User } from "@/models/User";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/user`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateUser = async (
  userId: string,
  userData: { name?: string; email?: string }
): Promise<User> => {
  const response = await axios.put(`${API_BASE_URL}/user/${userId}`, userData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createUser = async (userData: {
  name: string;
  email: string;
}): Promise<User> => {
  const response = await axios.post(`${API_BASE_URL}/user/sub-user`, userData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteUser = async (
  userId: string
): Promise<{ success: boolean }> => {
  const response = await axios.delete(`${API_BASE_URL}/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getUserData = async (): Promise<User> => {
  const response = await axios.get(`${API_BASE_URL}/user`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return response.data;
};
