import catalog from './catalog.json';
import { Artist, Catalog, Feedback, Playlist, Track } from '../models/music';

export const playlists: readonly Playlist[] = catalog.playlists;
export const tracks: readonly Track[] = catalog.tracks;
export const artists: readonly Artist[] = catalog.artists;
export const feedbacks: readonly Feedback[] = catalog.feedbacks;
export const initialCatalog: Catalog = { playlists, tracks, artists, feedbacks };
