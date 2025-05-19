import { Router } from "express";
import { ModuleController } from "../controllers/moduleController";
import { validateJWT, validateRole } from "../middleware/authMiddleware";

const router = Router();
const moduleController = new ModuleController();

router.post(
  "/",
  validateJWT,
  validateRole(["0"]),
  moduleController.createModule.bind(moduleController)
);
router.get(
  "/",
  validateJWT,
  moduleController.getAllModules.bind(moduleController)
);
router.get(
  "/tags",
  validateJWT,
  moduleController.getModulesByTags.bind(moduleController)
);
router.get(
  "/:id",
  validateJWT,
  moduleController.getModuleById.bind(moduleController)
);
router.put(
  "/:id",
  validateJWT,
  validateRole(["0"]),
  moduleController.updateModule.bind(moduleController)
);
router.delete(
  "/:id",
  validateJWT,
  validateRole(["0"]),
  moduleController.deleteModule.bind(moduleController)
);
router.get(
  "/:id/widget",
  validateJWT,
  moduleController.getWidgetComponent.bind(moduleController)
);
router.get(
  "/site/:siteId",
  validateJWT,
  moduleController.getModulesBySiteId.bind(moduleController)
);
router.post(
  "/site/:siteId",
  validateJWT,
  moduleController.assignModulesToSite.bind(moduleController)
);
router.delete(
  "/site/:siteId/modules",
  validateJWT,
  validateRole(["0", "1"]),
  moduleController.removeModulesFromSite.bind(moduleController)
);

export default router;
