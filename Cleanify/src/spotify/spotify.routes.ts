import express from "express";
import axios from "axios";
//import { getAccessToken } from "../auth/tokenStore";
//import { attachSpotifyToken } from "./middleware/authToken";

const router = express.Router();



// the /me route via spotify
router.get("/me", async (req, res) => {
    const token = (req as any).spotifyToken;
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error(error.response?.data);

    res.status(500).json({
      error: "Failed to fetch profile",
    });
  }
});

// The playlist route via spotify
router.get("/playlists", async (req, res) => {
    const token = (req as any).spotifyToken;
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "Failed to fetch playlists",
    });
  }
});

//The palylist songs route via spotify
router.get("/playlists/:playlistId/tracks", async (req, res) => {
    const token = (req as any).spotifyToken;
    //console.log("ACCESS TOKEN:", accessToken);
  const { playlistId } = req.params;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const tracks = response.data.items
  .filter((item: any) => item.track)
  .map((item: any) => ({
    id: item.track.id,
    name: item.track.name,
    artists: item.track.artists.map(
      (artist: any) => artist.name
    ),
    album: item.track.album.name,
    explicit: item.track.explicit,
    uri: item.track.uri,
  }));

    res.json(tracks);
    } catch (error: any) {
        console.error(error.response?.data || error.message);

        res.status(500).json({
        error: "Failed to fetch playlist tracks",
        });
    }
});

export default router;