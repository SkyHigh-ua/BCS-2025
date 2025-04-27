import axios from "axios";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

// Modules API
export const getDefaultModules = async () => {
  const response = await axios.get(`${API_BASE_URL}/modules/default`);
  return response.data;
};
