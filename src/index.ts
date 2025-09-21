import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TrackRow } from "./services/spotify_type.js";
import { mapResultsFromSpotify, searchTracks, searchTracksAdv } from "./services/spotify.js";

const server = new McpServer({
  name: "Spotify",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "get_names",
  "Get songs by track name or artist",
  {
    name: z.string().describe("Name of an artist or song to search for"),
  },
  async ({ name }) => {
    const query = name.trim();
    const songs = await searchTracks(query, 10);

    if (!songs) {
      // API call failed or returned undefined
      return {
        content: [
          { type: "text", text: "Failed to retrieve song data." }
        ],
      };
    }
    if (songs.length === 0) {
      // No results found for the query
      return {
        content: [
          { type: "text", text: `No songs found for "${query}".` }
        ],
      };
    }

    // Format each TrackRow into a readable line

    return {
      content: [
        { type: "text", text: mapResultsFromSpotify(songs, query) }
      ],
    };
  },
);



server.tool(
  "get_tracks",
  "Search tracks with optional artist/genre filters",
  {
    query:  z.string().optional(),
    artist: z.string().optional(),
    genre:  z.string().optional(),
    year:   z.string().optional(),   // "2019" or "2018-2021"
    //market: z.string().length(2).optional(),
    limit:  z.number().int().min(1).max(50).optional()
  },
  async (args) => {
    const songs = await searchTracksAdv(args);
    if (!songs.length) {
      return { content: [{ type: "text", text: "No songs matched that filter." }] };
    }
    const lines = songs.map((s, i) => {
      let line = `${i + 1}. "${s.title}" by ${s.artist}`;
      if (s.album) line += ` (Album: ${s.album})`;
      if (s.url)   line += ` – ${s.url}`;
      return line;
    });
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});