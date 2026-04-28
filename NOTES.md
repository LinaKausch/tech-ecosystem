# Notes

## DNA

    // dna: extension, color, speed, opacity, metalness
    // hidden dna: mass, healthScore, energy
    // extension: eg. cubeWidth = cubeSize + extension
    // energy: number to indicate how much energy the agent has to move
    // healthScore: probability to reproduce
    // mass: rate to survive harsh conditions?

<!-- ## Thursday to do -->
<!-- Fix the stars -->
<!-- ui on the display -->


## to do
    make new particles small 
    glow up the parents that spawning the new cubes

    storage for the whole system, no refresh, maybe hard refresh
<!--   
    <!-- display stats
    design stats --> 
<!-- 
    design qr code  -->

    camera animations +/-
    Add extra view on spawn and don't change the main view
    Think of overload animation

    Responsive UI

<!-- 
    system collapse -->
    design user input screens

    figure out the colors (limit color palete? new input colors don't bloom, too dark?) monochrome over time changing color? how? what is the logic behind? 

Do i want to add the button of not contributing to the system, what do i say then? 


## Rules for system load / try
If the number of alive agents reaches 300, then the message = '! System overload...!' and agents start pulsing shake. 
If the number of agents reaches 500, then the message = '! System failure...!' and agents falls down (y--) - system collapsed - true.
If the system is collapsed = true, then camera zooms out, spins, zooms in to the "new system".
New system start with dominant colors agents, starts again. adds +1 to the "system tries", counter starts over again,  stats: total agents restarts, dead agents restarts, number of total generations restarts and grows only on the current system inputs and population controls (not overall), user input number stays and continious growing, population control stays and continious growing
When the spawning new agents message = 'Generating output...' and camera shakes. 

STATS:
timer - per system (done)
alive agents - per system (done)
dead agents - per system  (done)
total agents - per system (done)
average health - current (done)
average energy - current (done)
total generations - per system (done)
population control generations - per system (done)
user inputs - per system (done)
system tries - universl (done)
total user inputs - universal (done)
currently connected - current (2/5) (done)
Record of longest system try - universal


## oboarding
You are connected to the system.
You can contribute, but not control it.
Your input influences the system.
The system has limits.




## Technical Summary for AI

**Project Type:** Real-time interactive 3D evolution simulator with remote input

**Core Data Structures:**
- `Agent`: {position: Vector3, dna: {widthExt, heightExt, depthExt, color: Color, speed, opacity, metalness, healthScore, mass}, mesh: THREE.Mesh, energy: number, isDead: boolean}
- `DNA`: Genetic blueprint with 8 traits (3 size extensions, HSL color, speed, opacity, metalness, hidden: healthScore, mass)
- `Particles`: 15 particles in blobs.js with position/velocity for density field

**Core Algorithms:**
1. **Agent Update Loop** (`updateAgent`): Energy burn = 0.1 / (1 + healthScore * 0.1); isDead when energy ≤ 0
2. **DNA Mixing** (`mixDNA`): Blends two parent DNAs with 50% mutation rate; blends colors via HSL interpolation; applies mutation ranges (±10% default)
3. **Population Control** (`populationControl`): Triggers when 2 < aliveAgents < 100; selects 2-4 random parents; spawns 40 offspring via staggered delays (35ms intervals)
4. **Color Mixing** (`mixColors`): HSL-based interpolation with hue wrapping, saturation/lightness clamping
5. **Order Behavior** (`orderInit` + `order`): Synchronized movement on grid (snap to 0.3 units); axis-by-axis sequential movement; easeInOutBack easing; spatial collision avoidance via occupied Set
6. **Marching Cubes**: 15 particles generate implicit density field; resolution 64; strength 0.09, subtract 3

**Data Flow:**
```
Remote User Input (ColorStep, ExtensionStep, HealthStep)
    → Socket.IO: emit("send-to-display", {dna})
    → Server: forward to "display" room
    → Display: socket.on("render-data", (data) => inputLife(scene, agents, data))
    → Spawn 40 agents with staggered delays (120ms intervals)
    → Agents integrated into scene, animateCluster, updateAgent loop
```

**Communication Protocol:**
- Socket.IO rooms: "display" (max 1), "remote" (max 5)
- Events: join-display, join-remote, send-to-display, render-data, remote-count
- Server: Express on port 3000; serves static files + Socket.IO
- Frontend: Vite on port 5173 with proxy to port 3000

**Rendering Pipeline:**
1. Canvas: React Three Fiber + Three.js WebGL
2. Scene: OrbitControls, PerspectiveCamera, lighting (directional)
3. Agents: RoundedBoxGeometry per agent, positioned, scaled by DNA extensions
4. Blobs: MarchingCubes mesh with ShaderMaterial (vertex/fragment GLSL)
5. Post-processing: Bloom effect via @react-three/postprocessing
6. Animation loop: requestAnimationFrame → updateAgent, animateBlobs, camera, render

**Key Implementation Details:**
- Agents spawned asynchronously (createAgent returns Promise)
- Energy consumption is inverse health (healthier = slower burn)
- Reproduction bias: random parent selection (no fitness weighting currently)
- Movement: synchronized via global syncState {cycle, agentsOnCycle} in order.js
- Color space: HSL (hue 0-1, saturation 0.35-1, lightness 0-1)
- Physics: Rapier3D imported but not heavily integrated
- Storage: No persistence (full reset on page reload)

**Performance Constraints:**
- Target 60 FPS; warn if < 30 FPS (not yet enforced)
- Agent limit: ~100-200 before performance degrades
- Marching Cubes at resolution 64 (lower = faster)
- Particle count: 15 fixed

**State Management:**
- Global refs: moduleSceneRef, moduleAgentsRef, moduleBlobsRef
- Tracking: generationTracker {total, fromPopulationControl, fromUserInput}
- Timing flags: identificationUntil, processingUntil, analysingUntil, generatingUntil
- Per-agent: userData {key, state, target, stepQueue, currentStep, cycle, agentId}

---

## Description

### OVERALL CONCEPT

Tech Ecosystem is an **interactive 3D evolutionary art installation** that visualizes living systems in real-time. It's a digital garden where creatures (agents) are born, evolve, consume energy, and die based on inherited genetic traits. The ecosystem is influenced by remote users via their phones, making them "genetic architects" who can inject new DNA into the system and watch their creations flourish or perish.

The project explores themes of:
- **Evolution undirected**: Can we observe natural selection behavior in a digital space?
- **Collaborative design**: How do multiple users influence a shared living system?
- **Visual emergence**: Can abstract traits (speed, health, color) create visually compelling forms?
- **Real-time feedback**: Show the immediate consequences of genetic choices

---

### DISPLAY SCREEN (Main 3D Viewport)

**What You See:**

1. **The Ecosystem** (3D canvas, center-dominant)
   - A dark, spacious 3D environment
   - Live creatures visible as **small individual boxes/cubes** with procedural shapes
   - Each creature has its own:
     - **Color** (vibrant/saturated colors ranging across the full spectrum)
     - **Size** (width, height, depth extensions that vary per agent)
     - **Glow** (metalness property creates reflective/shiny surfaces)
     - **Opacity** (some creatures semi-transparent, some solid)
   - Creatures **move smoothly** across the space in synchronized patterns (order behavior)
   - Movement is **choreographed**: agents move one axis at a time (X → wait → Y → wait → Z → wait → new target)

2. **Visual Effects**
   - **Bloom/glow** on both creatures and blob (post-processing effect)
   - **Custom shader animations** applied to the blob surface (time-based effects)
   - **Lighting**: multi-directional lights create depth and drama
   - **Grid-like movement**: agents snap to 0.3-unit positions, creating order in chaos

4. **UI Elements on Display**
   - **QR Code** (top-left or corner): Scannable code for remote device connection
   - **Shareable URL** (displayed or below QR): Click-friendly link (e.g., `http://localhost:5173/remote.html?id=abc123`)
   - **Generation Counter**: Shows total generations spawned
   - **Population Counter**: Current alive agent count
   - **Connected Remotes Counter**: How many phones are currently controlling the system
   - **Dominant Color Indicator**: Top 3 most common colors in the population (visual swatch or text)
   - **Health Diagram** (analytics panel): Visual representation of health distribution
   - **Movement Heatmap** (analytics panel): Shows where agents cluster/move most
   - **Timestamp**: Continuous update of date/time in MM.DD.HH:MM:SS format

**Technical Beauty:**
- Rendered in **Three.js** with real-time animation loop
- Camera can orbit around the ecosystem (mouse/touch enabled)
- Smooth 60 FPS rendering (goal: maintain above 30 FPS to avoid system collapse)
- Responsive to all agents' movements simultaneously

---

### REMOTE SCREEN (Phone/Tablet Interface)

**What You See:**

A **dark, minimalist multi-step wizard** where users design new creatures to inject into the ecosystem.

**Visual Design:**
- Dark background (usually black or very dark blue)
- Clean white/light text and UI elements
- Animated transitions between steps
- Centered form elements for mobile-first design

**Step-by-Step Interface:**

**Step 1: Color Selection**
- Large **color wheel** or **preset color buttons** (Red, Blue, Green)
- Visual preview of selected color
- Selected color fills a large swatch showing the creature's primary color
- Explanation: "Choose a color for your creature"
- Next button to proceed

**Step 2: Shape/Extension**
- Three **sliders** for Width, Height, Depth (0.0 - 0.5 scale)
- Real-time 3D preview of creature shape (using 3D scene renderer)
- Visual cube update as sliders change
- Explanation: "Define the creature's physical dimensions"
- Shows side-by-side comparison or rotatable 3D preview
- Next button

**Step 3: Physical Properties**
- **Health Score slider** (0 - 100)
  - Higher health = slower energy burn, longer lifespan
  - Visual feedback: health bar fills/changes color
- **Mass slider** (0 - 10)
  - Affects survival in harsh conditions
- Real-time preview updates
- Explanation text about each property
- Next/Submit button

**Step 4: Summary/Confirmation** (optional)
- Shows all selected traits in a summary
- "Create" or "Inject" button to send DNA to the display
- May show visual preview of the full creature

**Interaction Flow:**
1. User makes choices → each selection updates preview
2. Clicks "Next" to move to next step
3. At final step, clicks "Submit" or "Inject"
4. Data sent via Socket.IO to display server
5. Display receives data and spawns 40 new creatures with user's DNA
6. User sees their creatures appear on the big screen in the ecosystem!

**Visual Feedback:**
- Date/time always visible (MM.DD.HH:MM:SS)
- Smooth animations between steps
- 3D scene with starfield background
- Loading/processing states might show
- Confirmation that data was sent ("Sent to display!" message)

---

### THE CYCLE / INTERACTION LOOP

**What Happens in Real-Time:**

1. **Display runs continuously**
   - All 100+ creatures move in synchronized choreography
   - Energy burns (healthier creatures burn slower)
   - Blobs update to reflect creature positions
   - Camera orbits or stays fixed on the scene

2. **Population Control (automatic, every ~5-10 seconds)**
   - System checks: are there fewer than 100 agents alive?
   - YES → randomly pick 2-4 parent creatures
   - YES → blend their DNA with mutations
   - YES → spawn 40 new offspring (appears with visual delay)
   - These new creatures mix parent traits

3. **Remote User sends input**
   - User on phone fills out 3-4 steps
   - Clicks "Inject DNA"
   - Data travels via Socket.IO to server
   - Display receives event `render-data`
   - 40 new creatures instantly spawn with user's chosen traits
   - These creatures blend into the ecosystem

4. **Feedback Loop**
   - User sees 40 new creatures appear on display (same color they picked!)
   - These creatures live/move/reproduce
   - User watches if their DNA dominates the population
   - Can generate dominant color report
   - User is now invested in their genetic legacy

---

### VISUAL METAPHOR

- **Creatures** = Cells/organisms with phenotypes
- **DNA traits** = Genes controlling appearance and survival
- **Movement** = Synchronized behavior, choreography of life
- **Colors** = Visible genetic diversity
- **Energy** = Metabolic cost of existence
- **Reproduction** = Both automatic (population control) and user-directed (remote input)
- **Display room** = The garden/terrarium
- **Remote phone users** = Gardeners/designers influencing evolution

---

### SENSORY EXPERIENCE

**On the Display:**
- Vision: Vibrant colors, organic flowing shapes, hypnotic synchronized movement
- Contemplation: Watching life emerge and die in real-time
- Collaboration: Multiple phones controlling one ecosystem
- Elegance: Beautiful rendering, glowing effects, mathematical precision (grid-snapped but flowing)

**On the Remote:**
- Touch: Tactile sliders, button presses
- Creativity: Designing a creature by choosing its traits
- Anticipation: Waiting to see creatures appear on the big screen
- Feedback: Immediate visual changes, preview of creation

---

### CURRENT STATE & NEXT STEPS

**What's Working:**
- ✅ Agents spawn with procedural DNA
- ✅ Energy/death mechanics
- ✅ Color diversity
- ✅ Movement choreography (order behavior)
- ✅ Population control and breeding
- ✅ Remote input forms
- ✅ Socket.IO communication
- ✅ Real-time rendering

**What's Missing/In Progress:**
- ⏳ Persistent storage (restart = lost ecosystem)
- ⏳ "Parent glow" when creatures reproduce
- ⏳ Camera animations (cinematic views)
- ⏳ System collapse at FPS < 30 (population cull)
- ⏳ Color palette tuning (dim colors, monochrome drift)
- ⏳ Advanced stats display
- ⏳ Multi-behavior selection (not just "order")
- ⏳ Predator/prey or other complex interactions

---

## CODE QUALITY RATING

**Overall Score: 6.5/10**

### Individual Ratings:

| Category | Score | Notes |
|----------|-------|-------|
| **Rate/Quality** | 7/10 | Core ecosystem mechanics work well. Good Three.js + React integration. Animations are smooth. Some architectural issues. |
| **Feasibility** | 8/10 | Highly functional. Uses proven libraries (React, Three.js, Socket.IO). Scales reasonably well. Easy to add features. |
| **Understandability** | 6/10 | Good component naming and structure in places, but hard to follow state flow due to global variables. `index.jsx` is monolithic (500+ lines). Lacks documentation/JSDoc. |
| **Professionalism** | 7/10 | Good: React hooks, proper error handling, Socket.IO patterns. Bad: Global state management anti-pattern, no formal state manager, commented-out dead code. |
| **Cleanness** | 6/10 | Problems: `index.jsx` does too much, global variables scattered, ~50 lines of commented-out code. Good: Component separation in `/components/`. |
| **Optimised** | 5/10 | **Major issue**: `AnimationController` updates DOM every useFrame call (60fps) - inefficient. Re-filters alive agents 3+ times. No memoization. Good: Canvas rendering, Three.js mesh reuse. |

### Key Issues:

1. **DOM Updates Every Frame** ⚠️ Critical
   - Move stats/message updates to separate useEffect with state
   - Use refs for DOM elements, update only when values change

2. **Global State Antipattern**
   - `generatingUntil`, `isUserInputGeneration`, `processingUntil`, etc.
   - Replace with Context API or Zustand

3. **Monolithic index.jsx**
   - Extract: CameraAnimations, AnimationController, QR generation
   - Extract: Message logic, color calculations

4. **Dead Code**
   - Remove: `createBlobs`, `CameraShake` component, commented lights

5. **Agent Filtering**
   - Cache `aliveAgentsList` result, reuse instead of refiltering

### Strengths:

✅ Working ecosystem with evolution mechanics  
✅ Real-time Socket.IO sync  
✅ Smooth Three.js camera choreography  
✅ Good color palette and visual design  
✅ DNA mixing logic is elegant  

### Summary:

Solid **working prototype** (7-8/10 functionality) held back by **architectural/optimization debt** (5-6/10 implementation). With cleanup, easily 8+/10.
