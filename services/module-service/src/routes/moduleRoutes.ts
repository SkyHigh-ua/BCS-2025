import { Router } from "express";
import { ModuleController } from "../controllers/moduleController";
import { validateRole } from "../middleware/authMiddleware";

const router = Router();
const moduleController = new ModuleController();

router.post(
  "/",
  validateRole("0"),
  moduleController.createModule.bind(moduleController)
);
router.get("/", moduleController.getAllModules.bind(moduleController));
router.get("/:id", moduleController.getModuleById.bind(moduleController));
router.get(
  "/site/:siteId",
  moduleController.getModulesBySiteId.bind(moduleController)
);
router.put(
  "/:id",
  validateRole("0"),
  moduleController.updateModule.bind(moduleController)
);
router.delete(
  "/:id",
  validateRole("0"),
  moduleController.deleteModule.bind(moduleController)
);
router.post(
  "/site/:siteId",
  moduleController.assignModulesToSite.bind(moduleController)
);
router.get("/tags", moduleController.getModulesByTags.bind(moduleController));

export default router;
