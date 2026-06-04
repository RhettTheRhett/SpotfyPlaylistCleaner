import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import authRoutes from "./auth/auth.routes";
import spotifyRoutes from "./spotify/spotify.routes";
import { spotifyAuth } from "./middleware/spotifyAuth";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Session must come before any routes that use req.session
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60,
  }
}));

app.use("/auth", authRoutes);
app.use("/spotify", spotifyAuth, spotifyRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Spotify Cleaner API running" });
});

export default app;