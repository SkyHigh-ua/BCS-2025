import { Router } from "express";
import { PluginController } from "../controllers/pluginController";

const router = Router();
const pluginController = new PluginController();

router.get("/", pluginController.getAllPlugins.bind(pluginController));
router.get("/:id", pluginController.getPluginById.bind(pluginController));
router.post("/", pluginController.createPlugin.bind(pluginController));
router.put("/:id", pluginController.updatePlugin.bind(pluginController));
router.delete("/:id", pluginController.deletePlugin.bind(pluginController));

export default router;
