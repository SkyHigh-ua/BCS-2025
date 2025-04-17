import { SiteController } from "../src/controllers/siteController";
import { SiteRepository } from "../src/dal/SiteRepository";

jest.mock("../src/dal/SiteRepository");

const mockSiteRepository = new SiteRepository() as jest.Mocked<SiteRepository>;
const siteController = new SiteController(mockSiteRepository);

describe("Site Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch all sites", async () => {
    const mockSites = [
      { id: 1, url: "https://example1.com", sshDetails: "ssh://user@example1" },
      { id: 2, url: "https://example2.com", sshDetails: "ssh://user@example2" },
    ];
    mockSiteRepository.getAllSites.mockResolvedValue(mockSites);

    const req = {} as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await siteController.getAllSites(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockSites);
  });

  it("should fetch a site by ID", async () => {
    const mockSite = {
      id: 1,
      url: "https://example1.com",
      sshDetails: "ssh://user@example1",
    };
    mockSiteRepository.getSiteById.mockResolvedValue(mockSite);

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await siteController.getSiteById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockSite);
  });

  it("should return 404 if site not found by ID", async () => {
    mockSiteRepository.getSiteById.mockResolvedValue(null);

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await siteController.getSiteById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Site not found" });
  });

  it("should create a new site", async () => {
    const mockSite = {
      id: 1,
      url: "https://example1.com",
      sshDetails: "ssh://user@example1",
    };
    mockSiteRepository.createSite.mockResolvedValue(mockSite);

    const req = {
      body: { url: "https://example1.com", sshDetails: "ssh://user@example1" },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await siteController.createSite(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockSite);
  });

  it("should update a site's details", async () => {
    const mockUpdatedSite = { id: 1, url: "https://updated.com" };
    mockSiteRepository.updateSite.mockResolvedValue(mockUpdatedSite);

    const req = {
      params: { id: "1" },
      body: { url: "https://updated.com" },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await siteController.updateSite(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedSite);
  });

  it("should return 404 if site to update is not found", async () => {
    mockSiteRepository.updateSite.mockResolvedValue(null);

    const req = {
      params: { id: "1" },
      body: { url: "https://updated.com" },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await siteController.updateSite(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Site not found" });
  });

  it("should delete a site", async () => {
    mockSiteRepository.deleteSite.mockResolvedValue();

    const req = { params: { id: "1" } } as any;
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    await siteController.deleteSite(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
