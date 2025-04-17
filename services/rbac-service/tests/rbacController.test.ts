import { RoleController } from "../src/controllers/roleController";
import { GroupController } from "../src/controllers/groupController";
import { UserRepository } from "../src/dal/UserRepository";

jest.mock("../src/dal/UserRepository");

const mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
const roleController = new RoleController(mockUserRepository);
const groupController = new GroupController(mockUserRepository);

describe("Role Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should assign a role to a group", async () => {
    const req = { body: { groupId: 1, roleId: 2 } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await roleController.assignRoleToGroup(req, res);

    expect(mockUserRepository.assignRoleToGroup).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Role assigned to group successfully",
    });
  });

  it("should fetch all roles for a user", async () => {
    const mockRoles = [{ id: 1, name: "Admin" }];
    mockUserRepository.getRolesForUser.mockResolvedValue(mockRoles);

    const req = { params: { userId: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await roleController.getRolesForUser(req, res);

    expect(mockUserRepository.getRolesForUser).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockRoles);
  });

  it("should fetch all roles for a group", async () => {
    const mockRoles = [{ id: 2, name: "Editor" }];
    mockUserRepository.getRolesForGroup.mockResolvedValue(mockRoles);

    const req = { params: { groupId: "2" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await roleController.getRolesForGroup(req, res);

    expect(mockUserRepository.getRolesForGroup).toHaveBeenCalledWith(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockRoles);
  });

  it("should fetch all roles for a site", async () => {
    const mockRoles = [{ id: 3, name: "Viewer" }];
    mockUserRepository.getRolesForSite.mockResolvedValue(mockRoles);

    const req = { params: { siteId: "3" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await roleController.getRolesForSite(req, res);

    expect(mockUserRepository.getRolesForSite).toHaveBeenCalledWith(3);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockRoles);
  });
});

describe("Group Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a group", async () => {
    const mockGroup = {
      id: 1,
      name: "Test Group",
      description: "A test group",
    };
    mockUserRepository.createGroup.mockResolvedValue(mockGroup);

    const req = {
      body: { name: "Test Group", description: "A test group" },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await groupController.createGroup(req, res);

    expect(mockUserRepository.createGroup).toHaveBeenCalledWith(
      "Test Group",
      "A test group"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockGroup);
  });

  it("should fetch all groups", async () => {
    const mockGroups = [
      { id: 1, name: "Group 1" },
      { id: 2, name: "Group 2" },
    ];
    mockUserRepository.getAllGroups.mockResolvedValue(mockGroups);

    const req = {} as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await groupController.getAllGroups(req, res);

    expect(mockUserRepository.getAllGroups).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockGroups);
  });

  it("should fetch a group by ID", async () => {
    const mockGroup = { id: 1, name: "Group 1" };
    mockUserRepository.getGroupById.mockResolvedValue(mockGroup);

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await groupController.getGroupById(req, res);

    expect(mockUserRepository.getGroupById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockGroup);
  });

  it("should update a group", async () => {
    const mockUpdatedGroup = { id: 1, name: "Updated Group" };
    mockUserRepository.updateGroup.mockResolvedValue(mockUpdatedGroup);

    const req = { params: { id: "1" }, body: { name: "Updated Group" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await groupController.updateGroup(req, res);

    expect(mockUserRepository.updateGroup).toHaveBeenCalledWith(1, {
      name: "Updated Group",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedGroup);
  });

  it("should delete a group", async () => {
    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    await groupController.deleteGroup(req, res);

    expect(mockUserRepository.deleteGroup).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
