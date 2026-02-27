# Tech Ecosystem

An interactive generative landscape where technology mimics the behavior of a living ecosystem. A digital nature that responds to human interaction as environmental input.

##  Concept

The Tech Ecosystem is a visual art/interaction project that explores the relationship between human input and digital systems. It creates a breathing, living digital landscape that:

- **Grows organically** using natural algorithms and generative design principles
- **Responds sensitively** to human interaction (phone connections)
- **Self-regulates** based on system load - too much input causes "digital pollution" and system collapse
- **Remembers and evolves** through user-contributed vector drawings that get integrated into the ecosystem
- **Self-heals over time**

## How It Works

**Ecosystem Growth**: Generative algorithms create vector-based organisms that grow and evolve based on natural systems.

**User Input**: Users connect via phone and submit vector drawings. The system analyzes and integrates them into the ecosystem.

**System Balance**: Simple inputs create beautiful results. Too many concurrent inputs or complex drawings cause system collapse.

**Recovery**: After collapse, the ecosystem regenerates over time.

## Quick Start

### Requirements
- Node.js (v16+)
- npm or yarn
- Modern browser with WebGL support
- Mobile device for interaction testing

### Installation

```bash
# Clone the repository
git clone git@github.com:LinaKausch/ecosystem.git
cd ecosystem

# Install dependencies
npm install
```

### Running the Project

**Start Server** (production):
```bash
npm run start
```
Server runs on `http://localhost:3000`

**Development Server** (with live hot-reload and network access):
```bash
npm run dev -- --host
```
Server runs on `http://YOUR_LOCAL_IP:3000`

**Production Build**:
```bash
npm run build
```

**Preview Production Build**:
```bash
npm run preview
```

### Accessing the Application

1. Open your browser to the local IP address displayed in terminal
2. A QR code will be generated on the display page
3. Scan the QR code with your phone to connect as a remote participant
4. Use mouse/trackpad on desktop to rotate the 3D view with OrbitControls

## Current Status

### Completed
- Socket.IO server setup for real-time mobile connections
- Three.js 3D rendering engine initialized
- QR code generation for mobile access
- Basic canvas rendering with black background
- OrbitControls for 3D interaction
- Network connectivity testing

### In Development / TODO
- [ ] Generative landscape algorithm (particle system, growth patterns)
- [ ] Vector drawing input interface on mobile
- [ ] TensorFlow.js integration for vector analysis
- [ ] Custom WebGL shaders for ecosystem effects
- [ ] System health/load monitoring
- [ ] Ecosystem collapse detection and recovery mechanics
- [ ] Data persistence for drawn vectors
- [ ] Real-time ecosystem visualization of user contributions
- [ ] Performance optimization for multiple concurrent users
- [ ] Visual feedback system for user actions

## Technical Stack

### Graphics & Visualization
- **Three.js** - WebGL 3D rendering engine for ecosystem visualization
- **WebGL Shaders (GLSL)** - Custom vertex and fragment shaders for generative effects and particle systems
- **Procedural Generation** - Algorithm-based mesh and texture generation for organic structures

### AI & Machine Learning
- **TensorFlow.js** - On-device machine learning for vector drawing analysis
- **Neural Networks** - Pattern recognition to understand user-drawn shapes
- **Generative Algorithms** - Custom algorithms for ecosystem growth, morphing, and adaptation

### Core Technologies
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Real-time Communication**: Socket.IO - WebSocket-based bidirectional messaging
- **Server**: Express.js, Node.js
- **Build Tool**: Vite - Lightning-fast ES module based build tool
- **QR Code**: qrcode-generator library

### Future Technology Integration
- **Compute Shaders**: GPU-accelerated ecosystem evolution
- **WebAssembly (WASM)**: Performance-critical computations
- **WebWorkers**: Background AI and data processing threads
- **Instanced Rendering**: Efficient rendering of millions of particles

## Usage

### Display Screen
- Shows the evolving ecosystem in real-time
- Renders all user contributions and system state
- Displays connection status and system health metrics (future)

### Mobile Remote
- Connect to the ecosystem for drawing input
- See your contribution impact on the ecosystem (future)
- Receive visual feedback on system health

## Notes

This is an early-stage interactive art/technology experiment. The current version provides the infrastructure needed for real-time multi-user interaction. The core generative algorithms and AI-driven ecosystem adaptation are coming soon.


**Status**: Active Development
**Last Updated**: February 2026
