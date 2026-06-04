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

  // Store verifier on session instead of a module-level global.
  // This means each user/tab gets their own verifier, no race conditions.
  _req.session.codeVerifier = verifier;

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
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

router.get("/callback", async (req, res) => {
  // Handle the case where the user denied access on Spotify's page
  if (req.query.error) {
    return res.status(400).json({ error: req.query.error });
  }

  const code = req.query.code as string;

  if (!code) {
    return res.status(400).json({ error: "No authorization code received" });
  }

  const verifier = req.session.codeVerifier;

  if (!verifier) {
    return res
      .status(400)
      .json({ error: "No code verifier in session. Please log in again." });
  }

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
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Store token on session — persists across requests until cookie expires
    req.session.accessToken = response.data.access_token;

    // Clean up verifier — it's single-use
    delete req.session.codeVerifier;

    res.send("Auth successful. You can close this tab.");
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