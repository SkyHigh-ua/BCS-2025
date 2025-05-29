import { PluginController } from "../src/controllers/pluginController";
import { PluginRepository } from "../src/dal/PluginRepository";
import { loadPluginService } from "../src/services/pluginLoader";

jest.mock("../src/dal/PluginRepository");
jest.mock("../src/services/pluginLoader");

const mockPluginRepository =
  new PluginRepository() as jest.Mocked<PluginRepository>;
const pluginController = new PluginController(mockPluginRepository);

describe("Plugin Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch all plugins", async () => {
    const mockPlugins = [
      {
        id: 1,
        name: "Plugin1",
        description: "Desc1",
        filename: "file1.js",
        length: 123,
        type: "type1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Plugin2",
        description: "Desc2",
        filename: "file2.js",
        length: 456,
        type: "type2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mockPluginRepository.getAllPlugins.mockResolvedValue(mockPlugins);

    const req = {} as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await pluginController.getAllPlugins(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPlugins);
  });

  it("should fetch a plugin by ID", async () => {
    const mockPlugin = {
      id: 1,
      name: "Plugin1",
      description: "Desc1",
      filename: "file1.js",
      length: 123,
      type: "type1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPluginRepository.getPluginById.mockResolvedValue(mockPlugin);

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await pluginController.getPluginById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPlugin);
  });

  it("should return 404 if plugin not found by ID", async () => {
    mockPluginRepository.getPluginById.mockResolvedValue(null);

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await pluginController.getPluginById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Plugin not found" });
  });

  it("should create a new plugin", async () => {
    const mockPlugin = {
      id: 1,
      name: "Plugin1",
      description: "Desc1",
      filename: "file1.js",
      length: 123,
      type: "type1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPluginRepository.createPlugin.mockResolvedValue(mockPlugin);

    const req = {
      body: {
        name: "Plugin1",
        description: "Desc1",
        filename: "file1.js",
        length: 123,
        type: "type1",
      },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await pluginController.createPlugin(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockPlugin);
  });

  it("should update a plugin", async () => {
    const mockUpdatedPlugin = {
      id: 1,
      name: "UpdatedPlugin",
      description: "UpdatedDesc",
      filename: "updatedFile.js",
      length: 789,
      type: "updatedType",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPluginRepository.updatePlugin.mockResolvedValue(mockUpdatedPlugin);

    const req = {
      params: { id: "1" },
      body: {
        name: "UpdatedPlugin",
        description: "UpdatedDesc",
        filename: "updatedFile.js",
        length: 789,
        type: "updatedType",
      },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await pluginController.updatePlugin(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedPlugin);
  });

  it("should return 404 if plugin to update is not found", async () => {
    mockPluginRepository.updatePlugin.mockResolvedValue(null);

    const req = {
      params: { id: "1" },
      body: {
        name: "UpdatedPlugin",
        description: "UpdatedDesc",
        filename: "updatedFile.js",
        length: 789,
        type: "updatedType",
      },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await pluginController.updatePlugin(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Plugin not found" });
  });

  it("should delete a plugin", async () => {
    mockPluginRepository.deletePlugin.mockResolvedValue();

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    await pluginController.deletePlugin(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("should load a plugin successfully", async () => {
    const mockLoadPluginService = loadPluginService as jest.MockedFunction<
      typeof loadPluginService
    >;
    mockLoadPluginService.mockResolvedValue();

    const req = {
      params: { id: "1" },
      body: { sshKey: "test-ssh-key", otherParams: { param1: "value1" } },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await pluginController.loadPlugin(req, res);

    expect(mockLoadPluginService).toHaveBeenCalledWith("1", "test-ssh-key", {
      param1: "value1",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Plugin loaded successfully",
    });
  });

  it("should handle errors when loading a plugin", async () => {
    const mockError = new Error("Load plugin error");
    const mockLoadPluginService = loadPluginService as jest.MockedFunction<
      typeof loadPluginService
    >;
    mockLoadPluginService.mockRejectedValue(mockError);

    const req = {
      params: { id: "1" },
      body: { sshKey: "test-ssh-key", otherParams: { param1: "value1" } },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await pluginController.loadPlugin(req, res);

    expect(mockLoadPluginService).toHaveBeenCalledWith("1", "test-ssh-key", {
      param1: "value1",
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error loading plugin",
      error: mockError,
    });
  });
});
