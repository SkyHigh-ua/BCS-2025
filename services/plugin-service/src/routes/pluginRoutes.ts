import { Router } from "express";
import { PluginController } from "../controllers/pluginController";
import { validateRole } from "../middleware/authMiddleware";

const router = Router();
const pluginController = new PluginController();

// TODO: The /tags route should be placed before /:id to prevent it being caught by the ID pattern
// Get plugins by tags should be moved before getPluginById
router.get("/", pluginController.getAllPlugins.bind(pluginController));
router.get("/tags", pluginController.findPluginsByTags.bind(pluginController));
router.get("/:id", pluginController.getPluginById.bind(pluginController));
router.get(
  "/site/:siteId",
  pluginController.getSitePlugins.bind(pluginController)
);

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
// New route for updating plugin FQDN and outputs
router.put(
  "/:pluginId/config",
  validateRole(["0"]),
  pluginController.updatePluginFqdnAndOutputs.bind(pluginController)
);

export default router;
