import { Request, Response, NextFunction } from "express";
import { getAccessToken } from "../auth/tokenStore";

export function spotifyAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = getAccessToken();

  if (!token) {
    return res.status(401).json({
      error: "No Spotify access token. User must authenticate first.",
    });
  }

  // attach to request object
  (req as any).spotifyToken = token;

  next();
}