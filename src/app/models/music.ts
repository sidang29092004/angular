export interface Playlist {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  coverClass: string;
  coverTitle: string;
  coverSubtitle?: string;
  largeSubtitle?: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  image: string;
  duration: string;
  playlist: string;
  playlistId?: string;
  artistId?: string;
  description?: string;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
  bio?: string;
}

export interface Feedback {
  id: string;
  name: string;
  caption: string;
  initials: string;
  rating: number;
  createdAt: string;
  quote: string;
}

export interface Catalog {
  playlists: readonly Playlist[];
  tracks: readonly Track[];
  artists: readonly Artist[];
  feedbacks: readonly Feedback[];
}
