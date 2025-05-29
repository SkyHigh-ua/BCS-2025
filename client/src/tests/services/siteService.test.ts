import axios from "axios";
import * as siteService from "../../services/siteService";
import { Site } from "@/models/Site";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the getAuthHeaders function directly
const mockAuthHeaders = { Authorization: "Bearer test-token" };
jest
  .spyOn(siteService, "getAuthHeaders")
  .mockImplementation(() => mockAuthHeaders);

describe("SiteService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.API_BASE_URL = "http://localhost:3000";
  });

  test("getSites should return list of sites", async () => {
    const mockSites: Site[] = [
      {
        id: "site1",
        name: "Test Site",
        domain: "test.com",
        description: "Test Description",
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockSites });

    const result = await siteService.getSites();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:3000/api/sites",
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockSites);
  });

  test("createSite should create a new site", async () => {
    const siteData = {
      name: "New Site",
      domain: "newsite.com",
      description: "New Site Description",
    };

    const mockSite = {
      id: "site2",
      ...siteData,
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockSite });

    const result = await siteService.createSite(siteData);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/sites",
      siteData,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockSite);
  });

  test("updateSite should update an existing site", async () => {
    const siteId = "site1";
    const siteData = {
      name: "Updated Site",
      domain: "updated.com",
    };

    const mockSite = {
      id: siteId,
      name: "Updated Site",
      domain: "updated.com",
      description: "Original Description",
    };

    mockedAxios.put.mockResolvedValueOnce({ data: mockSite });

    const result = await siteService.updateSite(siteId, siteData);

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `http://localhost:3000/api/sites/${siteId}`,
      siteData,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockSite);
  });

  test("deleteSite should delete a site", async () => {
    const siteId = "site1";
    const mockResponse = { success: true };

    mockedAxios.delete.mockResolvedValueOnce({ data: mockResponse });

    const result = await siteService.deleteSite(siteId);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `http://localhost:3000/api/sites/${siteId}`,
      { headers: mockAuthHeaders }
    );
    expect(result).toEqual(mockResponse);
  });
});
