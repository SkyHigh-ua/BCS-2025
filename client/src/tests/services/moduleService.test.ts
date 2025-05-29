import axios from "axios";
import * as moduleService from "../../services/moduleService";
import { Module } from "@/models/Module";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the getAuthHeaders function directly
const mockAuthHeaders = { Authorization: "Bearer test-token" };
jest
  .spyOn(moduleService, "getAuthHeaders")
  .mockImplementation(() => mockAuthHeaders);

describe("ModuleService", () => {
  test("assignModules should assign modules to site", async () => {
    const mockResponse = { success: true };
    const moduleIds = ["module1", "module2"];

    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await moduleService.assignModules("site1", moduleIds);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `http://localhost:3000/api/modules/site/site1`,
      { moduleIds, cronExpression: "0 0 * * *" },
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockResponse);
  });

  test("fetchAllModules should return all modules", async () => {
    const mockModules: Module[] = [
      {
        id: "module1",
        name: "Module 1",
        description: "Description 1",
        tags: ["tag1", "tag2"],
      },
      {
        id: "module2",
        name: "Module 2",
        description: "Description 2",
        tags: ["tag2", "tag3"],
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockModules });

    const result = await moduleService.fetchAllModules();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://localhost:3000/api/modules/`,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockModules);
  });

  test("fetchModulesByTag should return modules by tag", async () => {
    const mockModules: Module[] = [
      {
        id: "module1",
        name: "Module 1",
        description: "Description 1",
        tags: ["default"],
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockModules });

    const result = await moduleService.fetchModulesByTag("default");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://localhost:3000/api/modules/tags`,
      {
        params: { tags: "default" },
        headers: mockAuthHeaders,
      }
    );
    expect(result).toEqual(mockModules);
  });

  test("getModulesBySiteId should return modules for a site", async () => {
    const mockModules: Module[] = [
      {
        id: "module1",
        name: "Module 1",
        description: "Description 1",
        tags: ["tag1"],
      },
      {
        id: "module2",
        name: "Module 2",
        description: "Description 2",
        tags: ["tag2"],
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockModules });

    const result = await moduleService.getModulesBySiteId("site1");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://localhost:3000/api/modules/site/site1`,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockModules);
  });

  test("removeModuleFromSite should remove a module from site", async () => {
    mockedAxios.delete.mockResolvedValueOnce({ status: 200 });

    const result = await moduleService.removeModuleFromSite("site1", "module1");

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `http://localhost:3000/api/modules/module1/site/site1`,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual({ success: true });
  });

  test("toggleModuleForSite should add module when enable is true", async () => {
    const mockResponse = { success: true };
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await moduleService.toggleModuleForSite(
      "site1",
      "module1",
      true
    );

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `http://localhost:3000/api/modules/site/site1`,
      { moduleIds: ["module1"], cronExpression: "0 0 * * *" },
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockResponse);
  });

  test("toggleModuleForSite should remove module when enable is false", async () => {
    mockedAxios.delete.mockResolvedValueOnce({ status: 200 });

    const result = await moduleService.toggleModuleForSite(
      "site1",
      "module1",
      false
    );

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `http://localhost:3000/api/modules/module1/site/site1`,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual({ success: true });
  });
});
