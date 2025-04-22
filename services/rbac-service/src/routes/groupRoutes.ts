import { Router } from "express";
import { GroupController } from "../controllers/groupController";
import { validateRole } from "../middleware/authMiddleware";

const router = Router();
const groupController = new GroupController();

router.post("/", groupController.createGroup.bind(groupController));
router.get(
  "/",
  validateRole([0]),
  groupController.getAllGroups.bind(groupController)
);
router.get("/:id", groupController.getGroupById.bind(groupController));
router.put("/:id", groupController.updateGroup.bind(groupController));
router.delete("/:id", groupController.deleteGroup.bind(groupController));

router.get(
  "/user/:userId/owned",
  groupController.getGroupsOwnedByUser.bind(groupController)
);

export default router;
