import axios from "axios";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

// Sites API
export const createSite = async (siteData: object) => {
  const response = await axios.post(`${API_BASE_URL}/sites`, siteData);
  return response.data;
};

export const addPluginToSite = async (siteId: string, pluginData: object) => {
  const response = await axios.post(
    `${API_BASE_URL}/sites/${siteId}/plugins`,
    pluginData
  );
  return response.data;
};

export const addModuleToSite = async (siteId: string, moduleData: object) => {
  const response = await axios.post(
    `${API_BASE_URL}/sites/${siteId}/modules`,
    moduleData
  );
  return response.data;
};
