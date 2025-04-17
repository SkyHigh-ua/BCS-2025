import { Router } from "express";
import { GroupController } from "../controllers/groupController";

const router = Router();
const groupController = new GroupController();

router.post("/", groupController.createGroup.bind(groupController));
router.get("/", groupController.getAllGroups.bind(groupController));
router.get("/:id", groupController.getGroupById.bind(groupController));
router.put("/:id", groupController.updateGroup.bind(groupController));
router.delete("/:id", groupController.deleteGroup.bind(groupController));

export default router;
