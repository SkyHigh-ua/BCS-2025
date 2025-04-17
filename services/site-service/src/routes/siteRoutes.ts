import { Router } from "express";
import { SiteController } from "../controllers/siteController";
import { validateJWT, validateRole } from "../middleware/authMiddleware";

const router = Router();
const siteController = new SiteController();

router.post(
  "/",
  validateJWT,
  validateRole(["admin", "moderator"]),
  siteController.createSite.bind(siteController)
);
router.get(
  "/",
  validateJWT,
  validateRole(["contributor", "admin", "moderator"]),
  siteController.getAllSites.bind(siteController)
);
router.get(
  "/:id",
  validateJWT,
  validateRole(["contributor", "admin", "moderator"]),
  siteController.getSiteById.bind(siteController)
);
router.put(
  "/:id",
  validateJWT,
  validateRole(["admin", "moderator"]),
  siteController.updateSite.bind(siteController)
);
router.delete(
  "/:id",
  validateJWT,
  validateRole(["admin"]),
  siteController.deleteSite.bind(siteController)
);
router.post(
  "/:id/plugins",
  validateJWT,
  validateRole(["admin", "moderator"]),
  siteController.addPluginToSite.bind(siteController)
);

export default router;
