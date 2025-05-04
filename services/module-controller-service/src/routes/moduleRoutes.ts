import { Router } from "express";
import moduleController from "../controllers/moduleController";
import { validateRole } from "../middleware/authMiddleware";

const router = Router();

// Use the imported controller object directly instead of instantiating a new controller
router.post(
  "/execute/:moduleId",
  moduleController.collectData.bind(moduleController)
);

export default router;
