import { ScheduleController } from "../src/controllers/scheduleController";
import axios from "axios";

jest.mock("axios");

describe("ScheduleController", () => {
  const scheduleController = new ScheduleController();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should schedule a module", async () => {
    const req = { body: { siteId: "1", moduleId: "2", interval: 1000 } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await scheduleController.scheduleModule(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Module 2 scheduled for site 1 every 1000ms",
    });
  });

  it("should not schedule a module if already scheduled", async () => {
    const req = { body: { siteId: "1", moduleId: "2", interval: 1000 } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await scheduleController.scheduleModule(req, res);
    await scheduleController.scheduleModule(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Module is already scheduled for this site",
    });
  });

  it("should unschedule a module", async () => {
    const req = { body: { siteId: "1", moduleId: "2", interval: 1000 } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    await scheduleController.scheduleModule(req, res);

    const unscheduleReq = { params: { siteId: "1", moduleId: "2" } } as any;
    const unscheduleRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    scheduleController.unscheduleModule(unscheduleReq, unscheduleRes);

    expect(unscheduleRes.status).toHaveBeenCalledWith(200);
    expect(unscheduleRes.json).toHaveBeenCalledWith({
      message: "Module 2 unscheduled for site 1",
    });
  });

  it("should return 404 if module is not scheduled", () => {
    const req = { params: { siteId: "1", moduleId: "3" } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

    scheduleController.unscheduleModule(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Module is not scheduled for this site",
    });
  });
});
