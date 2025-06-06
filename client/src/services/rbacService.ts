import axios from "axios";
import { Role } from "@/models/Role";
import { Group } from "@/models/Group";

const API_BASE_URL = `${process.env.API_BASE_URL}/api/rbac`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

export const assignRoleToUser = async (
  userId: string,
  roleId: string
): Promise<{ success: boolean }> => {
  const response = await axios.post(
    `${API_BASE_URL}/roles/assign`,
    { userId, roleId },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getRolesForUser = async (userId: string): Promise<Role[]> => {
  const response = await axios.get(`${API_BASE_URL}/roles/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getRolesForGroup = async (groupId: string): Promise<Role[]> => {
  const response = await axios.get(`${API_BASE_URL}/roles/group/${groupId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getRolesForSite = async (siteId: string): Promise<Role[]> => {
  const response = await axios.get(`${API_BASE_URL}/roles/site/${siteId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createGroup = async (groupData: {
  name: string;
  description: string;
}): Promise<Group> => {
  const response = await axios.post(`${API_BASE_URL}/groups`, groupData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateGroup = async (
  groupId: string,
  groupData: {
    name?: string;
    description?: string;
  }
): Promise<Group> => {
  const response = await axios.put(
    `${API_BASE_URL}/groups/${groupId}`,
    groupData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  const response = await axios.delete(`${API_BASE_URL}/groups/${groupId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getAllGroups = async (): Promise<Group[]> => {
  const response = await axios.get(`${API_BASE_URL}/groups`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const assignGroupToUser = async (
  userId: string,
  groupId: string
): Promise<{ success: boolean }> => {
  const response = await axios.post(
    `${API_BASE_URL}/groups/assign/user`,
    { userId, groupId },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const assignGroupToSite = async (
  groupId: string,
  siteId: string
): Promise<{ success: boolean }> => {
  const response = await axios.post(
    `${API_BASE_URL}/groups/assign/site`,
    { groupId, siteId },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getUserOwnedGroups = async (userId: string): Promise<Group[]> => {
  const response = await axios.get(
    `${API_BASE_URL}/groups/user/${userId}/owned`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const getGroupUsers = async (groupId: string): Promise<any[]> => {
  const response = await axios.get(`${API_BASE_URL}/groups/${groupId}/users`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getSitesForGroup = async (groupId: string): Promise<any[]> => {
  const response = await axios.get(`${API_BASE_URL}/groups/${groupId}/sites`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const removeSiteFromGroup = async (
  groupId: string,
  siteId: string
): Promise<void> => {
  const response = await axios.delete(
    `${API_BASE_URL}/groups/${groupId}/site/${siteId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};
