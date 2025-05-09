import { Router } from "express";
import { UserController } from "../controllers/userController";
import { validateJWT } from "../middleware/authMiddleware";
import { validateInternalService } from "../middleware/internalServiceMiddleware";

const router = Router();
const userController = new UserController();

router.get(
  "/me",
  validateJWT,
  userController.getCurrentUser.bind(userController)
);

router.get("/", validateJWT, userController.getAllUsers.bind(userController));
router.get(
  "/:id",
  validateJWT,
  userController.getUserById.bind(userController)
);
router.get(
  "/email/:email",
  validateJWT,
  userController.getUserByEmail.bind(userController)
);
router.post(
  "/",
  validateInternalService,
  userController.createUser.bind(userController)
);
router.post(
  "/sub-user",
  validateJWT,
  userController.createSubUser.bind(userController)
);
router.put("/:id", validateJWT, userController.updateUser.bind(userController));
router.delete(
  "/:id",
  validateJWT,
  userController.deleteUser.bind(userController)
);

export default router;
