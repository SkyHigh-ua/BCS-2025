import express from "express";
import cors from "cors";
import moduleRoutes from "./routes/moduleRoutes";
import logger from "./utils/logger";
import {
  initializeCleanupService,
  getCleanupService,
} from "./utils/moduleCleanup";
import moduleController from "./controllers/moduleController";

const app = express();
const PORT = process.env.PORT || 5010;

// Initialize cleanup service
const cleanupService = initializeCleanupService();

// Connect the module controller's cache to the cleanup service
cleanupService.setCacheReferenceGetter(() => moduleController.getRepoCache());
cleanupService.startCleanupScheduler();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  logger.debug(`Headers: ${JSON.stringify(req.headers)}`);
  logger.debug(`Body: ${JSON.stringify(req.body)}`);
  next();
});

// No need to make moduleController available to routes, as we're directly importing it

app.use("/", moduleRoutes);

app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err.stack || err.message || err);
  res.status(500).json({ message: "Internal Server Error" });
});

const server = app.listen(PORT, () => {
  logger.info(`Module controller service is running on port ${PORT}`);
});

// Handle graceful shutdown to ensure cleanup scheduler is stopped
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    const service = getCleanupService();
    if (service) {
      service.stopCleanupScheduler();
    }
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    const service = getCleanupService();
    if (service) {
      service.stopCleanupScheduler();
    }
  });
});
