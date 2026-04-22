# Tech Ecosystem

Interactive 3D ecosystem installation built with React + Three.js, where phone users inject DNA-like input and influence how agents evolve over time.

## What It Does

- Renders a live 3D agent ecosystem on the display screen
- Accepts remote user input through Socket.IO (phone flow)
- Generates offspring through population control and DNA mixing
- Tracks system pressure states (normal, overload, failure, reboot)
- Runs a full system lifecycle called a "system try"

## System Try Lifecycle

One complete cycle is one system try:

1. Normal operation (IDLE / GENERATING / OVERLOAD)
2. FAILURE when alive agents cross threshold
3. Camera zooms out and agents collapse
4. REBOOT wait period
5. Camera RECOVERING zoom-in
6. New agent batch spawns using dominant colors from previous system
7. System returns to IDLE and increments system tries

Core state machine and timing live in `src/world/system.jsx`.

## Current Camera States

- `IDLE`
- `GENERATING`
- `OVERLOAD`
- `FAILURE`
- `REBOOT`
- `RECOVERING`

Camera behavior is implemented in `src/components/react/CameraAnimations.jsx`.

## Stats

Implemented stats:

- Timer (per system)
- Alive agents (per system)
- Dead agents (per system)
- Total agents (per system)
- Average health (current)
- Average energy (current)
- Total generations (per system)
- Population control generations (per system)
- User inputs (per system)
- System tries (universal)
- Total user inputs (universal)
- Currently connected remotes (`x/5`)

Planned later:

- Longest system try (universal)

## Key Files

- `src/index.jsx`
  - Main display app, animation controller, stats DOM updates, reboot respawn flow
- `src/world/system.jsx`
  - Centralized state machine, messages, thresholds, reboot/recovery transitions
- `src/components/react/CameraAnimations.jsx`
  - Camera motion per state including failure zoom-out and recovery zoom-in
- `src/components/three/evolution.js`
  - DNA mixing, population control, input spawning, trigger cooldown
- `server/index.js`
  - Express + Socket.IO relay

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start Socket/Express server:

```bash
npm run start
```

3. Start Vite dev server:

```bash
npm run dev
```

4. Open:

- Display: `http://localhost:5173/`
- Remote: Use generated QR code / URL from display

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run start
```

## Stack

- React
- @react-three/fiber / drei / postprocessing
- Three.js
- Socket.IO
- Express
- Vite

## Notes

- Population control can be called frequently per frame, so a cooldown guard is applied in `evolution.js` to avoid burst overlap.
- During failure/reboot, spawn logic is blocked and agents are energy-drained; during recovery, new reboot agents are preserved.

Last updated: April 2026
