import axios from "axios";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const signup = async (
  email: string,
  password: string,
  first_name: string,
  last_name: string,
  company?: string
) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    email,
    password,
    first_name,
    last_name,
    company,
  });
  return response.data;
};
