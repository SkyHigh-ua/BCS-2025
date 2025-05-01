import axios from "axios";
import { Plugin } from "@/models/Plugin";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

export const fetchDefaultPlugins = async (): Promise<Plugin[]> => {
  const response = await axios.get(`${API_BASE_URL}/plugins`, {
    params: { tag: "default" },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const fetchPluginsByTag = async (tag: string): Promise<Plugin[]> => {
  const response = await axios.get(`${API_BASE_URL}/plugins`, {
    params: { tag },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getPluginById = async (pluginId: string): Promise<Plugin> => {
  const response = await axios.get(`${API_BASE_URL}/plugins/${pluginId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createPlugin = async (pluginData: any): Promise<Plugin> => {
  const response = await axios.post(`${API_BASE_URL}/plugins`, pluginData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updatePlugin = async (
  pluginId: string,
  pluginData: any
): Promise<Plugin> => {
  const response = await axios.put(
    `${API_BASE_URL}/plugins/${pluginId}`,
    pluginData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deletePlugin = async (
  pluginId: string
): Promise<{ success: boolean }> => {
  const response = await axios.delete(`${API_BASE_URL}/plugins/${pluginId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const assignPluginToSite = async (
  pluginId: string,
  siteId: string
): Promise<{ success: boolean }> => {
  const response = await axios.post(
    `${API_BASE_URL}/plugins/site/${pluginId}`,
    { siteId },
    { headers: getAuthHeaders() }
  );
  return response.data;
};
