import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls as OrbitControlsComponent, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer, Glitch, DotScreen, Vignette, DepthOfField, BrightnessContrast } from '@react-three/postprocessing';
import * as THREE from 'three';
import { cubeCluster, animateCluster } from './components/three/cubes.js';
import { createAgent } from './components/three/agent.js';
import { populationControl, inputLife } from './components/three/evolution.js';
import HealthDiagram from './components/react/utils/HealthDiagram.jsx';
import MovementHeatmap from './components/react/utils/MovementHeatmap.jsx';
import { CameraAnimations } from './components/react/CameraAnimations.jsx';
import { getFormattedTime } from './components/react/utils/Timer.jsx';
import * as System from './world/system.jsx';
import './style.css';

const persistedSaveData = System.loadPersistedStats();


//SOCKETS
const socket = window.io();
socket.off();

socket.on('connect', () => {
    console.log('%c✓ SOCKET CONNECTED', 'color: green; font-weight: bold;', 'ID:', socket.id);
    const url = `${new URL(`remote.html?id=${socket.id}`, window.location)}`;
    console.log('Generated URL:', url);

    const $url = document.getElementById('url');
    const $qr = document.getElementById('qr');

    if ($url) {
        $url.textContent = url;
        $url.setAttribute('href', url);
    }

    // Generate QR code
    if (typeof window.qrcode !== 'function') {
        console.error('qrcode library not available');
        return;
    }

    try {
        const qr = window.qrcode(4, 'L');
        qr.addData(url);
        qr.make();

        if ($qr) {
            const canvas = document.createElement('canvas');
            const moduleCount = qr.getModuleCount();
            const cellSize = 5;
            canvas.width = moduleCount * cellSize;
            canvas.height = moduleCount * cellSize;

            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#4b758d';
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (qr.isDark(row, col)) {
                        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    }
                }
            }
            $qr.innerHTML = '';
            $qr.appendChild(canvas);
        }
    } catch (e) {
        console.error('Error generating QR:', e);
    }
});

socket.on('disconnect', () => {
    console.log('%c✗ SOCKET DISCONNECTED', 'color: red;');
});

socket.on('error', (error) => {
    console.error('%c✗ SOCKET ERROR', 'color: red;', error);
});

// SCENE SETUP COMPONENT
const SceneSetup = ({ agentsRef }) => {
    const { scene } = useThree();

    useEffect(() => {
        System.setModuleRefs({ current: scene }, agentsRef);
        scene.background = new THREE.Color(0x1C1C1C);
        const fog = new THREE.FogExp2(0x1C1C1C, 0.01);
        scene.fog = fog;

        return () => {
        };
    }, [scene, agentsRef]);

    return null;
};

// LIGHTS
const Lights = () => {
    const lightRef = useRef();
    const lightColor = new THREE.Color(0x1E7D01);
    return (
        <>
            <directionalLight position={[-1, 0, 1]} intensity={0.5} color={lightColor} />
            <directionalLight position={[1, 0, 1]} intensity={0.5} color={lightColor} />
            <Stars radius={100} depth={100} count={5000} factor={6} saturation={10} fade speed={1} />
            <pointLight ref={lightRef} position={[0, 0, 0]} intensity={5} distance={100} color={lightColor} />
        </>
    );
};

const buildRebootDNA = (hexColor) => ({
    widthExt: Math.random() * 0.5,
    heightExt: Math.random() * 0.5,
    depthExt: Math.random() * 0.5,
    color: new THREE.Color(hexColor || '#c2260a'),
    speed: Math.random() * 0.02,
    healthScore: Math.random() * 100,
});

const getInitialAgentCount = () => {
    const savedAlive = persistedSaveData?.system?.alive;
    return Number.isFinite(savedAlive) && savedAlive > 0 ? savedAlive : 150;
};

const getInitialDominantPalette = () => {
    const savedColors = persistedSaveData?.system?.dominantColors;
    if (!Array.isArray(savedColors) || savedColors.length === 0) return null;
    return savedColors.map((color) => color.hex).filter(Boolean);
};

const applyPaletteToAgent = (agent, hexColor) => {
    const color = new THREE.Color(hexColor || '#c2260a');
    agent.dna.color = color;

    if (!agent.mesh?.traverse) return;

    agent.mesh.traverse((child) => {
        if (!child.isMesh || !child.material) return;

        child.material = child.material.clone();

        if (child.material.color) {
            child.material.color.set(color);
        }

        if (child.material.emissive) {
            child.material.emissive.set(color);
        }

        child.material.needsUpdate = true;
    });
};

const rebootSystemWithDominantColors = async (scene, agentsRef, dominantColors) => {
    agentsRef.current.forEach((agent) => {
        if (agent?.mesh) {
            scene.remove(agent.mesh);
        }
    });
    agentsRef.current = [];

    const palette = Array.isArray(dominantColors) && dominantColors.length > 0
        ? dominantColors.map((c) => c.hex)
        : ['#c2260a'];

    const spawnPromises = [];
    for (let i = 0; i < 150; i++) {
        const pickedHex = palette[i % palette.length];
        const dna = buildRebootDNA(pickedHex);
        spawnPromises.push(createAgent(scene, dna, new THREE.Vector3(0, 0, 0)));
    }

    const spawnedAgents = await Promise.allSettled(spawnPromises);
    spawnedAgents.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
            agentsRef.current.push(result.value);
        }
    });
};

// ANIMATION CONTROLLER
const AnimationController = ({ agentsRef }) => {
    const { scene } = useThree();
    const rebootSpawnInProgressRef = useRef(false);
    const lastPersistSignatureRef = useRef('');
    const lastBroadcastStateRef = useRef('');

    useFrame(() => {
        if (agentsRef.current) {
            animateCluster(scene, agentsRef.current, performance.now());
            if (!System.systemState.systemCollapsed && System.systemState.currentCameraState !== System.camera_States.REBOOT) {
                const popControlGen = populationControl(scene, agentsRef.current);
                System.handlePopulationControl(popControlGen);
            }

            const aliveAgents = agentsRef.current.filter(agent => !agent.isDead).length;
            const runtimeDeadAgents = agentsRef.current.filter(agent => agent.isDead).length;
            const deadAgents = System.systemState.deadAgentsOffset + runtimeDeadAgents;
            const totalAgents = aliveAgents + deadAgents;

            const aliveAgentsList = agentsRef.current.filter(agent => !agent.isDead);
            const totalEnergy = aliveAgentsList.reduce((sum, agent) => sum + (agent.energy || 0), 0);
            const avgEnergy = aliveAgents > 0 ? (totalEnergy / aliveAgents).toFixed(2) : 0;
            const totalHealthScore = aliveAgentsList.reduce((sum, agent) => sum + (agent.dna?.healthScore || 0), 0);
            const avgHealthScore = aliveAgents > 0 ? (totalHealthScore / aliveAgents).toFixed(2) : 0;

            const timeString = getFormattedTime(System.systemState.currentTryStartTime);

            // Get dominant colors
            const dominantColors = System.getDominantColors(aliveAgentsList);
            const colorHtml = dominantColors.map(c =>
                `<div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; background-color: ${c.hex}; border: 1px solid #444;"></div>
                    <span>${c.hex}</span>
                </div>`
            ).join('');

            const $statsEl = document.getElementById('stats');
            if ($statsEl) {
                $statsEl.innerHTML = `
                <div>
                    <div>${aliveAgents}</div>
                    <div>${deadAgents}</div>
                    <div>${totalAgents}</div>
                </div>
                <div>
                    <div>${avgHealthScore}</div>
                    <div>${avgEnergy}</div>
                </div>
                <div>
                    <div>${System.getTotalGenerations()}</div>
                    <div>${System.systemState.generationTracker.fromPopulationControl}</div>
                    <div>${System.systemState.generationTracker.fromUserInput}</div>
                </div>
                <div>
                    <div>${System.systemState.systemTries}</div>
                    <div>${System.systemState.totalUserInputs}</div>
                </div>
                `;
            }

            const $usersEl = document.getElementById('users');
            if ($usersEl) {
                $usersEl.innerHTML =
                    ` <div>${System.systemState.connectedPhones}/5</div>
                `;
            }
            const $colorDomEl = document.getElementById('color-dom');
            if ($colorDomEl) {
                $colorDomEl.innerHTML = `${colorHtml}`;
            }
            const $timeCounter = document.getElementById('time');
            if ($timeCounter) {
                $timeCounter.innerHTML = `<div>${timeString}</div>`;
            }
            const activeMessage = System.updateSystemState(agentsRef, aliveAgents, dominantColors);
            const currentBroadcastState = JSON.stringify({
                cameraState: System.systemState.currentCameraState,
                systemCollapsed: System.systemState.systemCollapsed,
            });

            if (currentBroadcastState !== lastBroadcastStateRef.current) {
                lastBroadcastStateRef.current = currentBroadcastState;
                socket.emit('system-state', {
                    cameraState: System.systemState.currentCameraState,
                    systemCollapsed: System.systemState.systemCollapsed,
                });
            }

            const persistSignature = [
                aliveAgents,
                deadAgents,
                totalAgents,
                dominantColors.map(color => color.hex).join('|'),
                Math.floor((Date.now() - System.systemState.currentTryStartTime) / 1000),
                System.systemState.systemTries,
                System.systemState.totalUserInputs,
                System.systemState.generationTracker.fromPopulationControl,
                System.systemState.generationTracker.fromUserInput,
            ].join('::');

            if (persistSignature !== lastPersistSignatureRef.current) {
                lastPersistSignatureRef.current = persistSignature;
                System.savePersistedStats(aliveAgents, deadAgents, dominantColors);
            }

            if (System.checkAndRestartAfterReboot() && !rebootSpawnInProgressRef.current) {
                rebootSpawnInProgressRef.current = true;
                rebootSystemWithDominantColors(scene, agentsRef, System.systemState.dominantColorsAtCollapse)
                    .catch((err) => {
                        console.error('Reboot spawn failed:', err);
                    })
                    .finally(() => {
                        rebootSpawnInProgressRef.current = false;
                    });
            }

            const isCollapseDrainPhase =
                System.systemState.currentCameraState === System.camera_States.FAILURE ||
                System.systemState.currentCameraState === System.camera_States.REBOOT;

            if (isCollapseDrainPhase) {
                agentsRef.current.forEach(agent => {
                    if (!agent.isDead) {
                        agent.energy -= 2;
                    }
                });
            }
            const $message = document.getElementById('message');
            if ($message) {
                $message.innerHTML = `<div>${activeMessage}</div>`;
            }
        }
    });
    return null;
};


// AGENTS COMPONENT
const Agents = ({ agentsRef }) => {
    const { scene } = useThree();

    useEffect(() => {
        (async () => {
            const spawnCount = getInitialAgentCount();
            const initialPalette = getInitialDominantPalette();
            const agents = await cubeCluster(scene, spawnCount);

            if (initialPalette && initialPalette.length > 0) {
                agents.forEach((agent, index) => {
                    applyPaletteToAgent(agent, initialPalette[index % initialPalette.length]);
                });
            }

            agentsRef.current = agents;
        })();
    }, [scene, agentsRef]);

    return null;
};

// MAIN SCENE COMPONENT
const Scene = ({ agentsRef }) => {
    return (
        <>
            <PerspectiveCamera position={[-1, 0, 9]} fov={40} makeDefault />
            <CameraAnimations />
            <OrbitControlsComponent
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2}
                enableDamping
                target={[0, 0, 0]}
            />
            <SceneSetup agentsRef={agentsRef} />
            <Lights />
            <Agents agentsRef={agentsRef} />
            <AnimationController agentsRef={agentsRef} />
            <mesh>
                <boxGeometry args={[10, 10, 10, 10, 10, 10]} />
                <meshBasicMaterial color={0x424242} side={THREE.BackSide} roughness={0} metalness={1} wireframe={true} />
            </mesh>
            <EffectComposer>
                <Bloom
                    luminanceThreshold={0.5}
                    luminanceSmoothing={5}
                    height={50}
                    intensity={1.8}
                    mipmapBlur={true}
                    radius={0.5}
                />
                {/* <Glitch delay={[0.3, 0.5]} duration={[0.01, 0.1]} strength={[0.01, 0.02]} /> */}
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
                {/* <DepthOfField focusDistance={0.3}
                    focalLength={0.02}
                    bokehScale={2} height={480} /> */}
                {/* <Pixelation granularity={4} /> */}
                {/* <BrightnessContrast brightness={0} contrast={-1} /> */}
            </EffectComposer>
        </>
    );
};

// INITIALIZE REMOTE DATA HANDLER
const handleRemoteData = System.initializeRemoteDataHandler(inputLife);

socket.on('render-data', (data) => {
    console.log('Display received data:', data);
    const userInputState = System.handleUserInput(data);
    handleRemoteData(userInputState.data, userInputState.generatingStartDelay);
});
socket.on('remote-count', (count) => {
    System.handleRemoteCount(count);
});

// DISPLAY COMPONENT
const Display = () => {
    const agentsRef = useRef(null);

    useEffect(() => {
        socket.emit('join-display');

        return () => { };
    }, []);

    return (
        <>
            <Canvas
                gl={{ antialias: true }}
                style={{ width: '100vw', height: '100vh' }}
            >
                <Scene agentsRef={agentsRef} />
            </Canvas>
            <HealthDiagram agentsRef={agentsRef} />
            <MovementHeatmap agentsRef={agentsRef} />
        </>
    );
};

// RENDER
const $root = ReactDOM.createRoot(document.getElementById('root'));
$root.render(
    <React.StrictMode>
        <Display />
    </React.StrictMode>
);