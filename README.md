# Tech Ecosystem

An experimental 3D project where a digital ecosystem evolves in real time and reacts to phone input.

## Concept

Tech Ecosystem treats a 3D environment like a living system: agents move, reproduce, and influence the visual field while procedural forms (blobs, cubes, shaders) keep the scene in constant motion.

## Phone connection

A display screen generates a QR/link for phone access. A connected phone opens a remote page and sends DNA-like inputs (color + geometry values) through Socket.IO. The display receives that data and injects it into the ecosystem behavior.

## Evolution loop (brief)

- Initial agents are spawned in the world
- When parent agents reach adulthood, offspring are generated
- Remote DNA input can be merged into later generations
- New offspring inherit and vary traits, then continue the cycle

## Run locally

### 1) Install

```bash
npm install
```

### 2) Start backend server (Socket.IO + static routes)

```bash
npm run start
```

Runs on `http://localhost:3000`.

### 3) Start Vite dev server (frontend HMR)

```bash
npm run dev
```

Vite runs on `http://localhost:5173` and proxies `/socket.io` traffic to `http://localhost:3000`.

## Interaction flow

1. Open the display in browser (`/`)
2. Use the generated URL/QR to open remote page (`/remote?id=...`)
3. On remote, press **Random Color** to send a DNA payload
4. Display receives payload and applies it to evolution flow in the scene

## Future work

- Stronger trait inheritance and mutation rules
- Better behavior logic across multiple generations
- More expressive remote controls beyond random input
- Clear ecosystem state feedback (health, stage, events)
- Visual/performance refinement of shaders and particle systems

## Socket behavior

- Room `display`: max 1 client
- Room `remote`: max 5 clients
- Remote emits `send-to-display`
- Server forwards to display as `render-data`

## Scripts

- `npm run dev` → Vite dev server
- `npm run build` → production frontend build
- `npm run preview` → preview built frontend
- `npm run start` → Node/Express/Socket.IO server

## Tech stack

- Three.js
- GLSL shaders
- Socket.IO
- Express
- Vite
- Rapier (`@dimforge/rapier3d-compat`)

## Status

Active prototype and iteration phase.

Last updated: March 2026
