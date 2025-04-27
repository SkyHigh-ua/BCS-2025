import { Router } from "express";
import { PluginController } from "../controllers/pluginController";
import { validateRole } from "../middleware/authMiddleware";

const router = Router();
const pluginController = new PluginController();

router.get("/", pluginController.getAllPlugins.bind(pluginController));
router.get("/:id", pluginController.getPluginById.bind(pluginController));
router.post(
  "/",
  validateRole(["0"]),
  pluginController.createPlugin.bind(pluginController)
);
router.put(
  "/:id",
  validateRole(["0"]),
  pluginController.updatePlugin.bind(pluginController)
);
router.delete(
  "/:id",
  validateRole(["0"]),
  pluginController.deletePlugin.bind(pluginController)
);
router.post(
  "/:id/load",
  validateRole(["0"]),
  pluginController.loadPlugin.bind(pluginController)
);
router.post(
  "/site/:pluginId",
  validateRole(["0"]),
  pluginController.assignPluginToSite.bind(pluginController)
);
router.get("/tags", pluginController.findPluginsByTags.bind(pluginController));

export default router;
