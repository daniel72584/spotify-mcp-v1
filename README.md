# MCP Spotify 
 * Tools: `get_tracks` and `get_names`
 * `get_names`: search by a single param
 * `get_tracks`: search by multiple params
 * Remember to compile before doing it

# How to run
* npm install
* npm run build -> generate tsc
* add config to claude

# Enviroment:
Given by [Spotify Credentials](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow)
* SPOTIFY_CLIENT_ID
* SPOTIFY_CLIENT_SECRET



# Configuration on claude:
```
{
  "mcpServers": {
    "sports": {
      "command": "node",
      "args": ["/userabsolutepath/build/index.js"],
      "env": {
        "SPOTIFY_CLIENT_ID": "xxxxx",
        "SPOTIFY_CLIENT_SECRET": "xxxx"
      }
    }
  }
}
```
