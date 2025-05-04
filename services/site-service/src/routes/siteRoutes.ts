import { Router } from "express";
import { SiteController } from "../controllers/siteController";
import { validateJWT, validateRole } from "../middleware/authMiddleware";

const router = Router();
const siteController = new SiteController();

// TODO: Client calls endpoint at /api/site but routes are defined at root level
// Either update the client or prefix all routes with /api/site

// TODO: Update route ordering to ensure specific routes come before dynamic ones
// The /my-sites route should be before /:id to prevent it being caught as an ID parameter
router.get(
  "/my-sites",
  validateJWT,
  validateRole(["0", "1", "2"]),
  siteController.getUserSites.bind(siteController)
);

// TODO: Client expects endpoint at /api/sites (plural) for getUserSites
// Add an additional route to match client expectations
router.get(
  "/sites",
  validateJWT,
  validateRole(["0", "1", "2"]),
  siteController.getUserSites.bind(siteController)
);

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

export default router;
