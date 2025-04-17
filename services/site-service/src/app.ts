import express from "express";
import cors from "cors";
import siteRoutes from "./routes/siteRoutes";
import logger from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", siteRoutes);

app.use((err: any, req: any, res: any, next: any) => {
  logger.error("Error:", err.stack || err.message || err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  logger.info(`Site service is running on port ${PORT}`);
});
