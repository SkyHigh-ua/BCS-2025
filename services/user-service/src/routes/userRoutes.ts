import { Router } from "express";
import { UserController } from "../controllers/userController";
import { validateJWT } from "../middleware/authMiddleware";

const router = Router();
const userController = new UserController();

router.get("/", validateJWT, userController.getAllUsers);
router.get("/:id", validateJWT, userController.getUserById);
router.get(
  "/username/:username",
  validateJWT,
  userController.getUserByUsername
);
router.get("/email/:email", validateJWT, userController.getUserByEmail);
router.post("/", validateJWT, userController.createUser);
router.put("/:id", validateJWT, userController.updateUser);
router.delete("/:id", validateJWT, userController.deleteUser);

export default router;
