import { Router } from "express";
import { PluginController } from "../controllers/pluginController";
import { validateJWT, validateRole } from "../middleware/authMiddleware";

const router = Router();
const pluginController = new PluginController();

router.get("/", pluginController.getAllPlugins.bind(pluginController));
router.get("/tags", pluginController.findPluginsByTags.bind(pluginController));
router.get("/:id", pluginController.getPluginById.bind(pluginController));
router.get(
  "/site/:siteId",
  pluginController.getSitePlugins.bind(pluginController)
);

router.post(
  "/",
  validateJWT,
  validateRole(["0"]),
  pluginController.createPlugin.bind(pluginController)
);
router.put(
  "/:id",
  validateJWT,
  validateRole(["0"]),
  pluginController.updatePlugin.bind(pluginController)
);
router.delete(
  "/:id",
  validateJWT,
  validateRole(["0"]),
  pluginController.deletePlugin.bind(pluginController)
);
router.post(
  "/:id/load",
  validateJWT,
  validateRole(["0"]),
  pluginController.loadPlugin.bind(pluginController)
);
router.post(
  "/site/:pluginId",
  validateJWT,
  validateRole(["0"]),
  pluginController.assignPluginToSite.bind(pluginController)
);
router.put(
  "/:pluginId/config",
  validateJWT,
  validateRole(["0"]),
  pluginController.updatePluginFqdnAndOutputs.bind(pluginController)
);

export default router;
