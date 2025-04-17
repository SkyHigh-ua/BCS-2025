import { ModuleController } from "../src/controllers/moduleController";
import { ModuleRepository } from "../src/dal/ModuleRepository";

jest.mock("../src/dal/ModuleRepository");

const mockModuleRepository =
  new ModuleRepository() as jest.Mocked<ModuleRepository>;
const moduleController = new ModuleController(mockModuleRepository);

describe("Module Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch all modules", async () => {
    const mockModules = [
      { id: 1, name: "Module1" },
      { id: 2, name: "Module2" },
    ];
    mockModuleRepository.getAllModules.mockResolvedValue(mockModules);

    const req = {} as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await moduleController.getAllModules(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockModules);
  });

  it("should fetch a module by ID", async () => {
    const mockModule = { id: 1, name: "Module1" };
    mockModuleRepository.getModuleById.mockResolvedValue(mockModule);

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await moduleController.getModuleById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockModule);
  });

  it("should return 404 if module not found by ID", async () => {
    mockModuleRepository.getModuleById.mockResolvedValue(null);

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await moduleController.getModuleById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Module not found" });
  });

  it("should create a new module", async () => {
    const mockModule = { id: 1, name: "Module1" };
    mockModuleRepository.createModule.mockResolvedValue(mockModule);

    const req = { body: { name: "Module1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await moduleController.createModule(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockModule);
  });

  it("should update a module", async () => {
    const mockUpdatedModule = { id: 1, name: "UpdatedModule" };
    mockModuleRepository.updateModule.mockResolvedValue(mockUpdatedModule);

    const req = { params: { id: "1" }, body: { name: "UpdatedModule" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await moduleController.updateModule(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedModule);
  });

  it("should return 404 if module to update is not found", async () => {
    mockModuleRepository.updateModule.mockResolvedValue(null);

    const req = { params: { id: "1" }, body: { name: "UpdatedModule" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await moduleController.updateModule(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Module not found" });
  });

  it("should delete a module", async () => {
    mockModuleRepository.deleteModule.mockResolvedValue();

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    await moduleController.deleteModule(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
