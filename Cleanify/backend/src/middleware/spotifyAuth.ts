import "express-session";

declare module "express-session" {
  interface SessionData {
    accessToken: string;
    codeVerifier: string;
  }
}

import { Request, Response, NextFunction } from "express";


 
export function spotifyAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.session.accessToken;
 
  if (!token) {
    return res.status(401).json({
      error: "Not authenticated. Visit /auth/login first.",
    });
  }
 
  (req as any).spotifyToken = token;
 
  next();
}