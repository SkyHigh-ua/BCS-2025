import axios from "axios";
import { Module } from "@/models/Module";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

export const assignModules = async (
  siteId: string,
  modules: string[],
  cronExpression: string
): Promise<{ success: boolean }> => {
  const response = await axios.post(
    `${API_BASE_URL}/modules/site/${siteId}`,
    { modules, cronExpression },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const fetchDefaultModules = async (): Promise<Module[]> => {
  const response = await axios.get(`${API_BASE_URL}/modules`, {
    params: { tag: "default" },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const fetchModulesByTag = async (tag: string): Promise<Module[]> => {
  const response = await axios.get(`${API_BASE_URL}/modules`, {
    params: { tag },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const fetchAllModules = async (): Promise<Module[]> => {
  const response = await axios.get(`${API_BASE_URL}/modules`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getModuleById = async (moduleId: string): Promise<Module> => {
  const response = await axios.get(`${API_BASE_URL}/modules/${moduleId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createModule = async (moduleData: any): Promise<Module> => {
  const response = await axios.post(`${API_BASE_URL}/modules`, moduleData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateModule = async (
  moduleId: string,
  moduleData: any
): Promise<Module> => {
  const response = await axios.put(
    `${API_BASE_URL}/modules/${moduleId}`,
    moduleData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteModule = async (
  moduleId: string
): Promise<{ success: boolean }> => {
  const response = await axios.delete(`${API_BASE_URL}/modules/${moduleId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getModulesBySiteId = async (siteId: string): Promise<Module[]> => {
  const response = await axios.get(`${API_BASE_URL}/modules/site/${siteId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
