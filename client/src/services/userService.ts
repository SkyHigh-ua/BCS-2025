import axios from "axios";
import { User } from "@/models/User";

const API_BASE_URL = `${process.env.API_BASE_URL}/api/user`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/sub-users`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateUser = async (
  userId: string,
  userData: {
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
  }
): Promise<User> => {
  const response = await axios.put(`${API_BASE_URL}/${userId}`, userData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createUser = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company?: string;
}): Promise<User> => {
  const response = await axios.post(`${API_BASE_URL}/sub-user`, userData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${userId}`, {
    headers: getAuthHeaders(),
  });
};

export const getUserData = async (): Promise<User> => {
  const response = await axios.get(`${API_BASE_URL}/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.data) {
    throw new Error("Failed to fetch user data");
  }

  return response.data;
};
