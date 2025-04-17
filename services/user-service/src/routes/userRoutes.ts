import { Router } from "express";
import { UserController } from "../controllers/userController";
import { validateJWT } from "../middleware/authMiddleware";

const router = Router();
const userController = new UserController();

router.get("/", validateJWT, userController.getAllUsers.bind(userController));
router.get(
  "/:id",
  validateJWT,
  userController.getUserById.bind(userController)
);
router.get(
  "/username/:username",
  validateJWT,
  userController.getUserByUsername.bind(userController)
);
router.get(
  "/email/:email",
  validateJWT,
  userController.getUserByEmail.bind(userController)
);
router.post("/", validateJWT, userController.createUser.bind(userController));
router.put("/:id", validateJWT, userController.updateUser.bind(userController));
router.delete(
  "/:id",
  validateJWT,
  userController.deleteUser.bind(userController)
);

export default router;
