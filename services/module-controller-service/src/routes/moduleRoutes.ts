import { Router } from "express";
import moduleController from "../controllers/moduleController";
import { fetchModuleInfo } from "../middleware/fetchModuleMiddleware";
import { ensureModuleRepo } from "../middleware/moduleMiddleware";

const router = Router();

// Execute a module with data collection
router.post(
  "/execute/:moduleId",
  fetchModuleInfo,
  ensureModuleRepo,
  moduleController.collectData.bind(moduleController)
);

// Get the widget component for a module
router.get(
  "/widget/:moduleId",
  fetchModuleInfo,
  ensureModuleRepo,
  moduleController.getWidgetComponent.bind(moduleController)
);

// Get module data without the widget component
router.get(
  "/data/:moduleId",
  moduleController.getModuleData.bind(moduleController)
);

// Get module data for a specific site
router.get(
  "/data/:moduleId/site/:siteId",
  moduleController.getModuleData.bind(moduleController)
);

export default router;
