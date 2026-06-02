import express from "express";
import axios from "axios";
import qs from "querystring";

import {
  generateCodeChallenge,
  generateCodeVerifier,
} from "./pkce";

const router = express.Router();

let verifierStore = "";

router.get("/login", async (_req, res) => {
  const verifier = generateCodeVerifier();

  verifierStore = verifier;

  const challenge = generateCodeChallenge(verifier);

  const scope = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "playlist-modify-public",
  ].join(" ");

  const params = qs.stringify({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  res.redirect(
    `https://accounts.spotify.com/authorize?${params}`
  );
});

router.get("/callback", async (req, res) => {
  const code = req.query.code as string;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        client_id: process.env.SPOTIFY_CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        code_verifier: verifierStore,
      }),
      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      }
    );

    const data = response.data;

    console.log(data);

    res.json(data);
  } catch (error: any) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "Authentication failed",
    });
  }
});

export default router;