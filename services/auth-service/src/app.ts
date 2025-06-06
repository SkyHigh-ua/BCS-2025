import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import logger from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 5001;

if (!process.env.USER_SERVICE_URL) {
  logger.error("USER_SERVICE_URL is not defined in the environment variables.");
  process.exit(1);
}

app.use(
  cors({
    origin: [process.env.GATEWAY_URL],
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

app.use("/", authRoutes);

app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err.stack || err.message || err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  logger.info(`Auth service is running on port ${PORT}`);
});
