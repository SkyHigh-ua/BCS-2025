import axios from "axios";
import * as authService from "../../services/authService";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    process.env.API_BASE_URL = "http://localhost:3000";
  });

  test("login should store token and return user data", async () => {
    const mockResponse = {
      login_token: "test-token",
      user: {
        id: "user1",
        name: "Test User",
        email: "test@example.com",
      },
    };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const credentials = { email: "test@example.com", password: "password123" };
    const result = await authService.login(credentials);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/auth/login",
      credentials
    );
    expect(localStorage.setItem).toHaveBeenCalledWith("jwt", "test-token");
    expect(result).toEqual(mockResponse);
  });

  test("signup should return user data", async () => {
    const mockResponse = {
      login_token: "test-token",
      user: {
        id: "user1",
        name: "Test User",
        email: "test@example.com",
      },
    };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const userData = {
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    };
    const result = await authService.signup(userData);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/auth/signup",
      userData
    );
    expect(result).toEqual(mockResponse);
  });

  test("logout should remove token from localStorage", () => {
    localStorage.setItem("jwt", "test-token");
    authService.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith("jwt");
  });

  test("getAuthHeaders should return authorization header with token", () => {
    localStorage.setItem("jwt", "test-token");

    const headers = authService.getAuthHeaders();

    expect(headers).toEqual({ Authorization: "Bearer test-token" });
  });
});
