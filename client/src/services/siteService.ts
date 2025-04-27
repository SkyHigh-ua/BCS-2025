import axios from "axios";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

export const createSite = async (siteData: {
  url: string;
  name: string;
  monitoringType: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/site`, siteData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getAllSites = async () => {
  const response = await axios.get(`${API_BASE_URL}/site`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getSiteById = async (siteId: string) => {
  const response = await axios.get(`${API_BASE_URL}/site/${siteId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateSite = async (siteId: string, siteData: any) => {
  const response = await axios.put(`${API_BASE_URL}/site/${siteId}`, siteData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteSite = async (siteId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/site/${siteId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getUserSites = async () => {
  const response = await axios.get(`${API_BASE_URL}/site/my-sites`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
