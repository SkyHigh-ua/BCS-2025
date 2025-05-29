import { Router } from "express";
import roleRoutes from "./roleRoutes";
import groupRoutes from "./groupRoutes";
import { validateJWT } from "../middleware/authMiddleware";

const router = Router();

router.use("/roles", validateJWT, roleRoutes);
router.use("/groups", validateJWT, groupRoutes);

export default router;
