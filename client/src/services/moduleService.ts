import axios from "axios";
import { Module } from "@/models/Module";

const API_BASE_URL = `${process.env.API_BASE_URL}/api/modules`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

export const assignModules = async (
  siteId: string,
  moduleIds: string[],
  cronExpression: string = "0 0 * * *"
): Promise<{ success: boolean }> => {
  const response = await axios.post(
    `${API_BASE_URL}/site/${siteId}`,
    { moduleIds, cronExpression },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const fetchDefaultModules = async (): Promise<Module[]> => {
  const response = await axios.get(`${API_BASE_URL}/tags`, {
    params: { tags: "default" },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const fetchModulesByTag = async (
  tags: string[] | string
): Promise<Module[]> => {
  const response = await axios.get(`${API_BASE_URL}/tags`, {
    params: { tags },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const fetchAllModules = async (): Promise<Module[]> => {
  const response = await axios.get(`${API_BASE_URL}/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getModuleById = async (moduleId: string): Promise<Module> => {
  const response = await axios.get(`${API_BASE_URL}/${moduleId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createModule = async (moduleData: any): Promise<Module> => {
  const response = await axios.post(`${API_BASE_URL}/`, moduleData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateModule = async (
  moduleId: string,
  moduleData: any
): Promise<Module> => {
  const response = await axios.put(`${API_BASE_URL}/${moduleId}`, moduleData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteModule = async (moduleId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${moduleId}`, {
    headers: getAuthHeaders(),
  });
};

export const getModulesBySiteId = async (siteId: string): Promise<Module[]> => {
  const response = await axios.get(`${API_BASE_URL}/site/${siteId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getWidgetComponent = async (
  moduleId: string
): Promise<{
  module: Module;
  component: string;
  inputs: any;
}> => {
  const response = await axios.get(`${API_BASE_URL}/${moduleId}/widget`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
