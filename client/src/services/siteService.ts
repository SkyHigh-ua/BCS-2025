import axios from "axios";
import { Site } from "@/models/Site";

const API_BASE_URL = `${process.env.API_BASE_URL}/api/sites`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

export const createSite = async (siteData: {
  domain: string;
  name: string;
  description: string;
}): Promise<Site> => {
  const response = await axios.post(`${API_BASE_URL}/`, siteData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getAllSites = async (): Promise<Site[]> => {
  const response = await axios.get(`${API_BASE_URL}/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getSiteById = async (siteId: string): Promise<Site> => {
  const response = await axios.get(`${API_BASE_URL}/${siteId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateSite = async (
  siteId: string,
  siteData: any
): Promise<Site> => {
  const response = await axios.put(`${API_BASE_URL}/${siteId}`, siteData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteSite = async (siteId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${siteId}`, {
    headers: getAuthHeaders(),
  });
};

export const getUserSites = async (): Promise<Site[]> => {
  const response = await axios.get(`${API_BASE_URL}/sites`, {
    headers: getAuthHeaders(),
  });

  if (!response.data) {
    throw new Error("Failed to fetch user sites");
  }

  return response.data;
};
