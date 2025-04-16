import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import logger from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

if (!process.env.USER_SERVICE_URL) {
  logger.error("USER_SERVICE_URL is not defined in the environment variables.");
  process.exit(1);
}

app.use("/", authRoutes);

app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err.stack || err.message || err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  logger.info(`Auth service is running on port ${PORT}`);
});
