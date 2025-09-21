import axios from "axios";
import { SearchParams, TrackRow } from "./spotify_type.js";

const ID = process.env.SPOTIFY_CLIENT_ID!;
const SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
if (!ID || !SECRET) throw new Error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env");

let token: string | null = null;
let expiresAtMs = 0; // epoch ms when token expires

async function getToken(): Promise<string> {
  const now = Date.now();
  if (token && now < expiresAtMs) return token;

  const basic = Buffer.from(`${ID}:${SECRET}`).toString("base64");
  const body = new URLSearchParams({ grant_type: "client_credentials" });

  const resp = await axios.post("https://accounts.spotify.com/api/token", body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${basic}`
    },
    timeout: 10_000
  });

  token = resp.data.access_token as string;
  const ttl = (resp.data.expires_in as number) ?? 3600; // seconds
  expiresAtMs = now + (ttl - 30) * 1000;                // safety margin
  return token!;
}


export async function searchTracks(q: string, limit = 10): Promise<TrackRow[]> {
  const tok = await getToken();
  const resp = await axios.get("https://api.spotify.com/v1/search", {
    params: { q, type: "track", limit },
    headers: { Authorization: `Bearer ${tok}` },
    timeout: 10_000
  });

  const items = (resp.data?.tracks?.items ?? []) as any[];
  return items.map(t => ({
    title: t.name,
    artist: (t.artists ?? []).map((a: any) => a.name).join(", "),
    album: t.album?.name,
    url: t.external_urls?.spotify
  }));
}

export function mapResultsFromSpotify(songs:TrackRow[], query:string){
     // Format each TrackRow into a readable line
    const formattedSongs = songs.map((song, index) => {
      // e.g., 1. "Song Title" by Artist (Album Name) - URL
      let line = `${index + 1}. "${song.title}" by ${song.artist}`;
      if (song.album) {
        line += ` (Album: ${song.album})`;
      }
      if (song.url) {
        line += ` – ${song.url}`;  // include the Spotify link
      }
      return line;
    });

    // Join all lines with newline characters
   return `Top ${songs.length} results for "${query}":\n` + formattedSongs.join("\n");

}


export async function searchTracksAdv({
  query = "",
  artist,
  genre,
  year,
  limit = 10
}: SearchParams): Promise<TrackRow[]> {
  const tok = await getToken();

  const parts: string[] = [];
  if (query.trim()) parts.push(query.trim());
  if (artist) parts.push(`artist:"${artist}"`);
  if (genre)  parts.push(`genre:"${genre}"`);
  if (year)   parts.push(`year:${year}`); // supports ranges like 2018-2021

  const q = parts.join(" ").trim();

  const resp = await axios.get("https://api.spotify.com/v1/search", {
    params: { q, type: "track", limit },
    headers: { Authorization: `Bearer ${tok}` },
    timeout: 10_000
  });

  const items = (resp.data?.tracks?.items ?? []) as any[];
  return items.map(t => ({
    title: t.name,
    artist: (t.artists ?? []).map((a: any) => a.name).join(", "),
    album: t.album?.name,
    url: t.external_urls?.spotify
  }));
}
