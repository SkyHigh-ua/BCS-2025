import axios from "axios";
import { User } from "@/models/User";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/user`);
  return response.data;
};

export const updateUser = async (
  userId: string,
  userData: { name?: string; email?: string }
): Promise<User> => {
  const response = await axios.put(`${API_BASE_URL}/user/${userId}`, userData);
  return response.data;
};

export const createUser = async (userData: {
  name: string;
  email: string;
}): Promise<User> => {
  const response = await axios.post(`${API_BASE_URL}/user/sub-user`, userData);
  return response.data;
};

export const deleteUser = async (
  userId: string
): Promise<{ success: boolean }> => {
  const response = await axios.delete(`${API_BASE_URL}/user/${userId}`);
  return response.data;
};

export const getUserData = async (): Promise<User> => {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) throw new Error("JWT not found");

  const response = await fetch("/api/user", {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return response.json();
};
