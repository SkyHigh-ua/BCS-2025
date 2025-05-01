import axios from "axios";
import { Role } from "@/models/Role";
import { Group } from "@/models/Group";

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

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
