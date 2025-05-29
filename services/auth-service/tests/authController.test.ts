import { AuthController } from "../src/controllers/authController";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";

jest.mock("axios");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthController", () => {
  const authController = new AuthController();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return a token for valid credentials", async () => {
      const req = {
        body: { username: "testuser", password: "password123" },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      (axios.get as jest.Mock).mockResolvedValue({
        data: { username: "testuser", password: "hashed_password" },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("mocked_token");

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: "mocked_token" });
    });

    it("should return 401 for invalid credentials", async () => {
      const req = {
        body: { username: "testuser", password: "wrongpassword" },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      (axios.get as jest.Mock).mockResolvedValue({
        data: { username: "testuser", password: "hashed_password" },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });

    it("should return 404 if user is not found", async () => {
      const req = {
        body: { username: "nonexistentuser", password: "password123" },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      (axios.get as jest.Mock).mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  describe("register", () => {
    it("should register a user and return a token", async () => {
      const req = {
        body: {
          username: "newuser",
          email: "newuser@example.com",
          password: "password123",
        },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      (axios.post as jest.Mock).mockResolvedValue({
        data: { id: 1, username: "newuser" },
      });
      (jwt.sign as jest.Mock).mockReturnValue("mocked_token");

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered",
        user: { id: 1, username: "newuser" },
        login_token: "mocked_token",
      });
    });

    it("should return 500 if registration fails", async () => {
      const req = {
        body: {
          username: "newuser",
          email: "newuser@example.com",
          password: "password123",
        },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      (axios.post as jest.Mock).mockRejectedValue(
        new Error("Registration error")
      );

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error registering user",
        error: expect.any(Error),
      });
    });
  });
});
