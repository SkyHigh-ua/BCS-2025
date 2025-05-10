import express from "express";
import cors from "cors";
import scheduleRoutes from "./routes/scheduleRoutes";
import logger from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 5011;

app.use(
  cors({
    origin: [
      process.env.GATEWAY_URL,
      process.env.MODULE_SERVICE_URL,
      process.env.MODULE_CONTROLLER_SERVICE_URL,
    ].filter((url): url is string => !!url),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  logger.debug(`Headers: ${JSON.stringify(req.headers)}`);
  logger.debug(`Body: ${JSON.stringify(req.body)}`);
  next();
});

app.use("/", scheduleRoutes);

app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err.stack || err.message || err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  logger.info(`Scheduler service is running on port ${PORT}`);
});
