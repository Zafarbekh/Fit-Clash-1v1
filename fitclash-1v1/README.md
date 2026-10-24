# FitClash 1v1 — runnable starter project

This project includes:
- Browser webcam capture using `getUserMedia`
- Real-time pose landmarks and a neon skeleton overlay using MediaPipe Pose Landmarker
- Basic push-up rep counter (elbow bend -> elbow extension, with visibility/torso checks)
- Node.js + Express server and Socket.IO real-time matchmaking
- Private rooms with five-character room codes
- Both players must ready up; server relays rep counts and match status
- Responsive cyberpunk/eSports interface

## Requirements
- Node.js 18 or newer
- A modern Chrome or Edge browser
- Internet access on first load for the MediaPipe JavaScript/WASM/model assets
- Camera permission

## Run locally on Windows
1. Install Node.js LTS from https://nodejs.org/ if needed.
2. Extract the ZIP into a normal folder, for example `C:\Users\YourName\Downloads\fitclash-1v1`.
3. Open that folder in File Explorer.
4. Click the address bar, type `cmd`, and press Enter.
5. Run:

   ```bash
   npm install
   npm start
   ```

6. Open `http://localhost:3000` in Chrome or Edge.
7. Allow camera permission and press **Enable camera**.
8. Open the same address in another browser/device on the same network to test a second player. For a second device, use the computer's LAN IP instead of localhost; the browser camera usually requires HTTPS on non-localhost origins.
9. For internet multiplayer, deploy the Node app to a public HTTPS-capable host. Both players must connect to that same server URL.

## Test multiplayer
- Open the app in two separate browser sessions.
- For global matchmaking, click **Global Matchmaking** in both sessions.
- For a private match, create a room in one session, copy the five-character code, then join it in the other.
- Both players click **Ready / Start**.
- Keep the camera visible and complete push-ups. Rep updates are sent to the room server.

## Important limitations / next production steps
This is a runnable MVP, not a fully hardened commercial game:
- Pose-based rep counting is a practical heuristic, not a medical-grade form evaluator. Camera angle, clothing, lighting and body orientation affect accuracy. Test in a safe space and stop if you feel pain or dizziness.
- The app detects pose locally in the browser; raw video is not uploaded by this app.
- Global matchmaking pairs the next two connected players. No region selection, ranked ELO, reconnect grace period, persistent database, accounts, moderation or anti-cheat is implemented yet.
- Room and player state are held in server memory and disappear when the server restarts.
- The timer is client-driven in this MVP; a production version should make the server authoritative for start/end time.
- For production, add database-backed accounts/stats, server-authoritative match clocks, rate limits, robust validation, HTTPS, monitoring and deployment configuration.
- MediaPipe assets are loaded from CDN. An internet connection is required when opening the app for the first time.

## Project structure
```
fitclash-1v1/
  package.json
  server.js
  public/
    index.html
    style.css
    app.js
  README.md
```
