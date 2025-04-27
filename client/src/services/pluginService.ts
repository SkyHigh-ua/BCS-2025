import axios from "axios";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

// Plugins API
export const getDefaultPlugins = async () => {
  const response = await axios.get(`${API_BASE_URL}/plugins/default`);
  return response.data;
};
