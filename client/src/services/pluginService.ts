import axios from "axios";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

export const fetchDefaultPlugins = async (params: { tag: string }) => {
  const response = await axios.get(`${API_BASE_URL}/plugins`, {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getPluginById = async (pluginId: string) => {
  const response = await axios.get(`${API_BASE_URL}/plugins/${pluginId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createPlugin = async (pluginData: any) => {
  const response = await axios.post(`${API_BASE_URL}/plugins`, pluginData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updatePlugin = async (pluginId: string, pluginData: any) => {
  const response = await axios.put(
    `${API_BASE_URL}/plugins/${pluginId}`,
    pluginData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deletePlugin = async (pluginId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/plugins/${pluginId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const assignPluginToSite = async (pluginId: string, siteId: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/plugins/site/${pluginId}`,
    { siteId },
    { headers: getAuthHeaders() }
  );
  return response.data;
};
