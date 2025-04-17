import { Router } from "express";
import { ModuleController } from "../controllers/moduleController";
import { validateRole } from "../middleware/authMiddleware";

const router = Router();
const moduleController = new ModuleController();

router.post(
  "/",
  validateRole("sysops"),
  moduleController.createModule.bind(moduleController)
);
router.get("/", moduleController.getAllModules.bind(moduleController));
router.get("/:id", moduleController.getModuleById.bind(moduleController));
router.put(
  "/:id",
  validateRole("sysops"),
  moduleController.updateModule.bind(moduleController)
);
router.delete(
  "/:id",
  validateRole("sysops"),
  moduleController.deleteModule.bind(moduleController)
);
router.post(
  "/execute/:id",
  moduleController.executeModule.bind(moduleController)
);

export default router;
