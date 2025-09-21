import { searchTracks } from "./spotify.js";


(async () => {
  const rows = await searchTracks("bad bunny", 5);
  console.table(rows);
})().catch(err => {
  if (err.response) {
    console.error("HTTP", err.response.status, err.response.data);
  } else {
    console.error(err);
  }
  process.exit(1);
});
