import { Router } from "express";
import { ScheduleController } from "../controllers/scheduleController";

const router = Router();
const scheduleController = new ScheduleController();

router.post(
  "/schedule",
  scheduleController.scheduleModule.bind(scheduleController)
);
router.delete(
  "/unschedule/:siteId/:moduleId",
  scheduleController.unscheduleModule.bind(scheduleController)
);

export default router;
