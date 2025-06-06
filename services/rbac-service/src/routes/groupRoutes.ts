import { Router } from "express";
import { GroupController } from "../controllers/groupController";
import { validateRole } from "../middleware/authMiddleware";

const router = Router();
const groupController = new GroupController();

router.post("/", groupController.createGroup.bind(groupController));
router.get(
  "/",
  validateRole(["0"]),
  groupController.getAllGroups.bind(groupController)
);
router.get("/:id", groupController.getGroupById.bind(groupController));
router.put("/:id", groupController.updateGroup.bind(groupController));
router.delete("/:id", groupController.deleteGroup.bind(groupController));
router.get(
  "/:id/sites",
  groupController.getSitesForGroup.bind(groupController)
);
router.delete(
  "/:groupId/site/:siteId",
  groupController.removeSiteFromGroup.bind(groupController)
);

router.get(
  "/user/:userId/owned",
  groupController.getGroupsOwnedByUser.bind(groupController)
);
router.post(
  "/assign/site",
  groupController.assignGroupToSite.bind(groupController)
);
router.post(
  "/assign/user",
  groupController.assignGroupToUser.bind(groupController)
);

router.get("/:id/users", groupController.getGroupUsers.bind(groupController));

export default router;
