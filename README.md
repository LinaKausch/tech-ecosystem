# Tech Ecosystem

An experimental 3D visualization where a digital ecosystem evolves in real time through procedural blob generation, powered by agent-driven behaviors and remote input.

## Concept

Tech Ecosystem is an interactive visualization that simulates living behavior in a 3D space:
- **Agents** move through the environment, consuming energy at rates determined by their health traits
- **Marching Cubes** algorithm creates dynamic blob geometry from agent positions
- **Evolution** occurs through reproduction—low population spawns new offspring with inherited and mutated traits
- **Remote input** (via phone) injects DNA-like parameters that influence the ecosystem's genetic composition
- **Multi-directional lighting** and custom shaders create an immersive visual presentation

## Core Features

### Energy & Survival
- Each agent burns energy proportional to its inverse health score
- When energy reaches zero, agents die
- Population control automatically spawns offspring when population drops below 50

### Visual Generation
- Blobs are rendered using **MarchingCubes** algorithm, with strength and isolation values driving the mesh
- Particle positions create implicit density fields that influence blob morphology
- **GLSL shaders** apply time-based animations to the geometry

### Evolution Loop
- Initial agents spawn with randomized DNA traits
- When population is low, random survivors are selected for breeding
- New offspring inherit blended DNA with mutation
- Remote DNA input can be merged into generation evolution

### Phone Connection
- Display screen generates QR code and shareable URL
- Connected phones open a remote interface with:
  - **Color buttons** (Blue, Red, Green) to send color input
  - **Shape sliders** to adjust width, height, depth parameters
- Socket.IO forwards remote input to the display for ecosystem injection

## Run Locally

### 1) Install dependencies

```bash
npm install
```

### 2) Start the backend/Socket.IO server

```bash
npm run start
```

Server runs on `http://localhost:3000`.

### 3) Start the Vite dev server

```bash
npm run dev
```

Vite runs on `http://localhost:5173` (with proxy to Socket.IO on port 3000).

### 4) Open in browser

- **Display**: `http://localhost:5173/` (or `http://localhost:3000/`)
- **Remote**: Scan the QR code or use the generated URL to connect a phone

## Architecture

### Scene (`src/world/scene.js`)
- Three.js Scene with camera, directional lights, and blob renderer
- Animation loop updates particle positions and renders MarchingCubes mesh
- OrbitControls for interactive camera

### Agents (`src/components/agent.js`)
- DNA: extension, color, speed, opacity, metalness, healthScore, mass
- Energy: decreases each frame based on health (healthier = lower burn rate)
- Mesh: RoundedBoxGeometry with procedural displacement

### Blobs (`src/particles/blobs.js`)
- 15 particles with random positions and velocities
- Each particle bounces within a defined spread
- MarchingCubes updates every frame using particle density
- Vertex/Fragment shaders apply time-based effects

### Evolution (`src/components/evolution.js`)
- `mixDNA()`: Blends parent traits with mutation
- `populationControl()`: Spawns offspring when population drops

### Input (`src/world/input.js`)
- Color buttons and shape sliders trigger callbacks
- Events are emitted through Socket.IO to remote interface

## Socket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join-display` | Remote → Server | Register as display viewport |
| `send-to-display` | Remote → Server | Send color/shape input |
| `render-data` | Server → Display | Forward user input to scene |

## Scripts

```bash
npm run dev      # Vite dev server with HMR
npm run build    # Production frontend build
npm run preview  # Preview built frontend
npm run start    # Node/Express/Socket.IO server
```

## Tech Stack

- **Three.js** — 3D graphics engine
- **GLSL** — Vertex and fragment shaders
- **Marching Cubes** — Mesh generation from particle density
- **Socket.IO** — Real-time client-server communication
- **Rapier** — Physics engine for agent interactions
- **Vite** — Frontend build tool
- **Express** — Backend server

## Future Enhancements

- [ ] Real-time population/health metrics display
- [ ] Selectable agent tracking and inspection
- [ ] Advanced remote controls (mutation rate, energy thresholds)
- [ ] Persistent ecosystem state and replay functionality
- [ ] Multi-user ecosystem influence and competition
- [ ] Performance optimization for larger agent populations
- [ ] Behavior variations beyond float/wander (predator/prey dynamics)

## Status

**Active development** — Currently exploring blob-based visualization and population dynamics.

Last updated: March 2026
