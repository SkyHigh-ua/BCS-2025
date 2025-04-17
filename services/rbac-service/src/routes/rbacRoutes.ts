import { Router } from "express";
import roleRoutes from "./roleRoutes";
import groupRoutes from "./groupRoutes";

const router = Router();

router.use("/roles", roleRoutes);
router.use("/groups", groupRoutes);

export default router;
