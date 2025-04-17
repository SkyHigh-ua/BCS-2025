import { Router } from "express";
import { RoleController } from "../controllers/roleController";

const router = Router();
const roleController = new RoleController();

router.post("/", roleController.createRole.bind(roleController));
router.get("/", roleController.getAllRoles.bind(roleController));
router.get("/:id", roleController.getRoleById.bind(roleController));
router.put("/:id", roleController.updateRole.bind(roleController));
router.delete("/:id", roleController.deleteRole.bind(roleController));

router.post(
  "/assign-to-group",
  roleController.assignRoleToGroup.bind(roleController)
);
router.get(
  "/user/:userId",
  roleController.getRolesForUser.bind(roleController)
);
router.get(
  "/group/:groupId",
  roleController.getRolesForGroup.bind(roleController)
);
router.get(
  "/site/:siteId",
  roleController.getRolesForSite.bind(roleController)
);

export default router;
