import axios from "axios";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

export const assignModules = async (
  siteId: string,
  modules: string[],
  cronExpression: string
) => {
  const response = await axios.post(
    `${API_BASE_URL}/modules/site/${siteId}`,
    { modules, cronExpression },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const fetchDefaultModules = async (params: { tag: string }) => {
  const response = await axios.get(`${API_BASE_URL}/modules`, {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getModuleById = async (moduleId: string) => {
  const response = await axios.get(`${API_BASE_URL}/modules/${moduleId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createModule = async (moduleData: any) => {
  const response = await axios.post(`${API_BASE_URL}/modules`, moduleData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateModule = async (moduleId: string, moduleData: any) => {
  const response = await axios.put(
    `${API_BASE_URL}/modules/${moduleId}`,
    moduleData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteModule = async (moduleId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/modules/${moduleId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getModulesBySiteId = async (siteId: string) => {
  const response = await axios.get(`${API_BASE_URL}/modules/site/${siteId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
