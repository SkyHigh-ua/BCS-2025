import { UserController } from "../src/controllers/userController";
import { UserRepository } from "../src/dal/UserRepository";

jest.mock("../src/dal/UserRepository");

const mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
const userController = new UserController(mockUserRepository);

describe("User Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch all users", async () => {
    const mockUsers = [
      { id: 1, username: "user1", email: "user1@example.com" },
      { id: 2, username: "user2", email: "user2@example.com" },
    ];
    mockUserRepository.getAllUsers.mockResolvedValue(mockUsers);

    const req = {} as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await userController.getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

  it("should fetch a user by ID", async () => {
    const mockUser = { id: 1, username: "user1", email: "user1@example.com" };
    mockUserRepository.getUserById.mockResolvedValue(mockUser);

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await userController.getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  it("should return 404 if user not found by ID", async () => {
    mockUserRepository.getUserById.mockResolvedValue(null);

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await userController.getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should create a new user", async () => {
    const mockUser = { id: 1, username: "user1", email: "user1@example.com" };
    mockUserRepository.createUser.mockResolvedValue(mockUser);

    const req = {
      body: { username: "user1", email: "user1@example.com", password: "pass" },
      headers: { "x-internal-service": "true" },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await userController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  it("should update a user's details", async () => {
    const mockUpdatedUser = { id: 1, username: "updatedUser" };
    mockUserRepository.updateUser.mockResolvedValue(mockUpdatedUser);

    const req = {
      params: { id: "1" },
      body: { username: "updatedUser" },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await userController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
  });

  it("should return 404 if user to update is not found", async () => {
    mockUserRepository.updateUser.mockResolvedValue(null);

    const req = {
      params: { id: "1" },
      body: { username: "updatedUser" },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await userController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should delete a user", async () => {
    mockUserRepository.deleteUser.mockResolvedValue();

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    await userController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
