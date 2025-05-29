import axios from "axios";
import * as userService from "../../services/userService";
import { User } from "@/models/User";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the getAuthHeaders function directly
const mockAuthHeaders = { Authorization: "Bearer test-token" };
jest
  .spyOn(userService, "getAuthHeaders")
  .mockImplementation(() => mockAuthHeaders);

describe("UserService", () => {
  test("fetchUsers should return users list", async () => {
    const mockUsers: User[] = [
      { id: "1", name: "User 1", email: "user1@example.com" },
      { id: "2", name: "User 2", email: "user2@example.com" },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockUsers });

    const result = await userService.fetchUsers();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://localhost:3000/api/user/sub-users`,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockUsers);
  });

  test("updateUser should update user information", async () => {
    const mockUser: User = {
      id: "1",
      name: "Updated User",
      email: "updated@example.com",
    };
    const userData = {
      email: "updated@example.com",
      first_name: "Updated",
      last_name: "User",
    };

    mockedAxios.put.mockResolvedValueOnce({ data: mockUser });

    const result = await userService.updateUser("1", userData);

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `http://localhost:3000/api/user/1`,
      userData,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockUser);
  });

  test("createUser should create a new user", async () => {
    const mockUser: User = {
      id: "3",
      name: "New User",
      email: "new@example.com",
    };
    const userData = {
      email: "new@example.com",
      password: "password123",
      first_name: "New",
      last_name: "User",
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockUser });

    const result = await userService.createUser(userData);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `http://localhost:3000/api/user/sub-user`,
      userData,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockUser);
  });

  test("deleteUser should delete a user", async () => {
    mockedAxios.delete.mockResolvedValueOnce({});

    await userService.deleteUser("1");

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `http://localhost:3000/api/user/1`,
      { headers: mockAuthHeaders }
    );
  });

  test("getUserData should return user data", async () => {
    const mockUser: User = {
      id: "1",
      name: "Current User",
      email: "current@example.com",
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    const result = await userService.getUserData();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://localhost:3000/api/user/me`,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockUser);
  });

  test("getUserData should throw an error if no data is returned", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: null });

    await expect(userService.getUserData()).rejects.toThrow(
      "Failed to fetch user data"
    );
  });
});
