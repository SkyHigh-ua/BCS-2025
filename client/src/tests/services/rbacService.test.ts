import axios from "axios";
import * as rbacService from "../../services/rbacService";
import { Role } from "@/models/Role";
import { Group } from "@/models/Group";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the getAuthHeaders function directly
const mockAuthHeaders = { Authorization: "Bearer test-token" };
jest
  .spyOn(rbacService, "getAuthHeaders")
  .mockImplementation(() => mockAuthHeaders);

// Set up environment before tests
beforeAll(() => {
  // Ensure API_BASE_URL is defined for all tests
  process.env.API_BASE_URL = "http://localhost:3000";
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
  // Reset localStorage mock for each test
  localStorage.clear();
  localStorage.setItem("jwt", "test-token");
});

describe("RbacService", () => {
  test("assignRoleToUser should assign role to user", async () => {
    const mockResponse = { success: true };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await rbacService.assignRoleToUser("user1", "role1");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `http://localhost:3000/api/rbac/roles/assign`,
      { userId: "user1", roleId: "role1" },
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockResponse);
  });

  test("getRolesForUser should return user roles", async () => {
    const mockRoles: Role[] = [
      { id: "role1", name: "Admin" },
      { id: "role2", name: "Editor" },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockRoles });

    const result = await rbacService.getRolesForUser("user1");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://localhost:3000/api/rbac/roles/user/user1`,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockRoles);
  });

  test("createGroup should create a new group", async () => {
    const mockGroup: Group = { id: "group1", name: "Test Group" };
    const groupData = { name: "Test Group", description: "Test Description" };

    mockedAxios.post.mockResolvedValueOnce({ data: mockGroup });

    const result = await rbacService.createGroup(groupData);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `http://localhost:3000/api/rbac/groups`,
      groupData,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockGroup);
  });

  test("updateGroup should update a group", async () => {
    const mockGroup: Group = { id: "group1", name: "Updated Group" };
    const groupData = { name: "Updated Group" };

    mockedAxios.put.mockResolvedValueOnce({ data: mockGroup });

    const result = await rbacService.updateGroup("group1", groupData);

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `http://localhost:3000/api/rbac/groups/group1`,
      groupData,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockGroup);
  });

  test("getAllGroups should return all groups", async () => {
    const mockGroups: Group[] = [
      { id: "group1", name: "Group 1" },
      { id: "group2", name: "Group 2" },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockGroups });

    const result = await rbacService.getAllGroups();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://localhost:3000/api/rbac/groups`,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockGroups);
  });

  test("assignGroupToSite should assign group to site", async () => {
    const mockResponse = { success: true };

    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await rbacService.assignGroupToSite("group1", "site1");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `http://localhost:3000/api/rbac/groups/assign/site`,
      { groupId: "group1", siteId: "site1" },
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockResponse);
  });
});
