import { Router } from "express";
import { RoleController } from "../controllers/roleController";
import { validateRole } from "../middleware/authMiddleware";

const router = Router();
const roleController = new RoleController();

router.post("/", roleController.createRole.bind(roleController));
router.get(
  "/",
  validateRole(["0"]),
  roleController.getAllRoles.bind(roleController)
);
router.get("/:id", roleController.getRoleById.bind(roleController));
router.put("/:id", roleController.updateRole.bind(roleController));
router.delete("/:id", roleController.deleteRole.bind(roleController));
router.post("/assign", roleController.assignRole.bind(roleController));
router.post(
  "/assign/group",
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
