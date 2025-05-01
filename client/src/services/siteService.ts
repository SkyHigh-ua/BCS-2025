import axios from "axios";
import { Site } from "@/models/Site";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

export const createSite = async (siteData: {
  url: string;
  name: string;
  monitoringType: string;
}): Promise<Site> => {
  const response = await axios.post(`${API_BASE_URL}/site`, siteData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getAllSites = async (): Promise<Site[]> => {
  const response = await axios.get(`${API_BASE_URL}/site`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getSiteById = async (siteId: string): Promise<Site> => {
  const response = await axios.get(`${API_BASE_URL}/site/${siteId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateSite = async (
  siteId: string,
  siteData: any
): Promise<Site> => {
  const response = await axios.put(`${API_BASE_URL}/site/${siteId}`, siteData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteSite = async (
  siteId: string
): Promise<{ success: boolean }> => {
  const response = await axios.delete(`${API_BASE_URL}/site/${siteId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getUserSites = async (): Promise<Site[]> => {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) throw new Error("JWT not found");

  const response = await fetch("/api/sites", {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user sites");
  }

  return response.json();
};
