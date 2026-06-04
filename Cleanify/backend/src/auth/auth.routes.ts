import "express-session";

declare module "express-session" {
  interface SessionData {
    accessToken: string;
    codeVerifier: string;
  }
}

import express from "express";
import axios from "axios";
import qs from "querystring";

import { generateCodeChallenge, generateCodeVerifier } from "./pkce";

const router = express.Router();

router.get("/login", (_req, res) => {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  // Encode verifier in state param instead of session
  const state = Buffer.from(verifier).toString('base64');

  const scope = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-read-private",
  ].join(" ");

  const params = qs.stringify({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

router.get("/callback", async (req, res) => {
  if (req.query.error) {
    return res.status(400).json({ error: req.query.error });
  }

  const code = req.query.code as string;
  const state = req.query.state as string;

  if (!code || !state) {
    return res.status(400).json({ error: "Missing code or state" });
  }

  // Decode verifier from state
  const verifier = Buffer.from(state, 'base64').toString('utf-8');

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        client_id: process.env.SPOTIFY_CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        code_verifier: verifier,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    req.session.accessToken = response.data.access_token;
    res.redirect("http://127.0.0.1:5173/playlists");
  } catch (error: any) {
    console.error("Token exchange failed:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to exchange authorization code" });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

export default router;