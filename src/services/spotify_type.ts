// Minimal shape for what we actually use
export interface TrackRow {
  title: string;
  artist: string;
  album?: string;
  url?: string;
}

export interface SearchParams {
  query?: string;          // free text
  artist?: string;         // filter by artist
  genre?: string;          // filter by genre
  year?: string;           // "2019" or "2018-2021"
  market?: string;         // e.g., "CO"
  limit?: number;          // 1..50
}

