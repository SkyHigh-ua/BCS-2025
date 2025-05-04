import { Router } from "express";
import { UserController } from "../controllers/userController";
import { validateJWT } from "../middleware/authMiddleware";
import { validateInternalService } from "../middleware/internalServiceMiddleware";

const router = Router();
const userController = new UserController();

// TODO: Client expects route at /api/user but routes are defined at root level
// The route should be prefixed in app.ts

// TODO: Client calls to /api/user (without ID) to fetch user data,
// but server has getAllUsers for this route which returns all users
// Add a route for getting the current user data
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
