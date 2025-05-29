import axios from "axios";
import { Plugin } from "@/models/Plugin";

const API_BASE_URL = `${process.env.API_BASE_URL}/api/plugins`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

export const fetchDefaultPlugins = async (): Promise<Plugin[]> => {
  const response = await axios.get(`${API_BASE_URL}/tags`, {
    params: { tags: "default" },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const fetchPluginsByTag = async (
  tags: string[] | string
): Promise<Plugin[]> => {
  const response = await axios.get(`${API_BASE_URL}/tags`, {
    params: { tags },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getPluginById = async (pluginId: string): Promise<Plugin> => {
  const response = await axios.get(`${API_BASE_URL}/${pluginId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createPlugin = async (pluginData: any): Promise<Plugin> => {
  const response = await axios.post(`${API_BASE_URL}/`, pluginData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updatePlugin = async (
  pluginId: string,
  pluginData: any
): Promise<Plugin> => {
  const response = await axios.put(`${API_BASE_URL}/${pluginId}`, pluginData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deletePlugin = async (pluginId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${pluginId}`, {
    headers: getAuthHeaders(),
  });
};

export const assignPluginToSite = async (
  pluginId: string,
  siteId: string
): Promise<{ success: boolean }> => {
  const response = await axios.post(
    `${API_BASE_URL}/site/${pluginId}`,
    { siteId },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const fetchSitePlugin = async (siteId: string): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/site/${siteId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
