import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./auth/auth.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Spotify Cleaner API running",
  });
});

export default app;