import axios from "axios";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const signup = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    email,
    password,
  });
  return response.data;
};
