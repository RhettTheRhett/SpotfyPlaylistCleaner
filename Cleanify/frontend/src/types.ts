export interface PlaylistImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  images: PlaylistImage[];
  owner: {
    display_name: string;
    id: string;
  };
  tracks: {
    total: number;
  };
  public: boolean;
  collaborative: boolean;
}

export interface Track {
  id: string;
  name: string;
  artists: string[];
  album: string;
  explicit: boolean;
  uri: string;
}

export interface CleanifyReport {
  originalPlaylist: string;
  newPlaylistId: string;
  newPlaylistUrl: string;
  totalTracksProcessed: number;
  keptClean: Track[];
  substituted: { original: Track; replacement: Track }[];
  unresolved: Track[];
}