import { Router } from "express";
import { SiteController } from "../controllers/siteController";
import { validateJWT, validateRole } from "../middleware/authMiddleware";

const router = Router();
const siteController = new SiteController();

router.post(
  "/",
  validateJWT,
  validateRole(["0", "1"]),
  siteController.createSite.bind(siteController)
);
router.get(
  "/",
  validateJWT,
  validateRole(["0"]),
  siteController.getAllSites.bind(siteController)
);
router.get(
  "/:id",
  validateJWT,
  validateRole(["0", "1", "2"]),
  siteController.getSiteById.bind(siteController)
);
router.put(
  "/:id",
  validateJWT,
  validateRole(["0", "1", "2"]),
  siteController.updateSite.bind(siteController)
);
router.delete(
  "/:id",
  validateJWT,
  validateRole(["0"]),
  siteController.deleteSite.bind(siteController)
);
router.get(
  "/my-sites",
  validateJWT,
  validateRole(["0", "1", "2"]),
  siteController.getUserSites.bind(siteController)
);

export default router;
