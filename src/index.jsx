import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Stars, AccumulativeShadows, RandomizedLight, OrbitControls as OrbitControlsComponent, PerspectiveCamera, useHelper } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { blobs as createBlobs, animateBlobs } from './particles/blobs.js';
import { cubeCluster, animateCluster } from './components/three/cubes.js';
import { populationControl, inputLife, INPUT_SPAWN_DELAY_MS, INPUT_SPAWN_COUNT } from './components/three/evolution.js';
import HealthDiagram from './components/react/HealthDiagram.jsx';
import MovementHeatmap from './components/react/MovementHeatmap.jsx';
import './style.css';

const socket = window.io();

socket.off();

socket.on('connect', () => {
    console.log('%c✓ SOCKET CONNECTED', 'color: green; font-weight: bold;', 'ID:', socket.id);
    //add connected socket id tot the screen
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
        const qrHtml = qr.createImgTag(4);

        if ($qr) {
            $qr.innerHTML = qrHtml;

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

// Global refs for socket handlers
let moduleSceneRef = null;
let moduleAgentsRef = null;
let moduleBlobsRef = null;
let connectedPhones = 0;
let lastConnectedPhones = 0;
let identificationUntil = 0;
let processingUntil = 0;
let analysingUntil = 0;
let generatingUntil = 0;
let generationTracker = {
    total: 1,
    fromPopulationControl: 1,
    fromUserInput: 0
};
// Function to get dominant colors
const getDominantColors = (agents, count = 3) => {
    const colorMap = new Map();

    agents.forEach(agent => {
        if (!agent.isDead && agent.dna?.color) {
            const hex = '#' + agent.dna.color.getHexString().toUpperCase();
            colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }
    });

    return Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([hex, count]) => ({ hex, count }));
};
// Scene Setup Component
const SceneSetup = ({ agentsRef }) => {
    const { scene } = useThree();

    useEffect(() => {
        moduleSceneRef = { current: scene };
        moduleAgentsRef = agentsRef;

        // Setup background and fog
        scene.background = new THREE.Color(0x1C1C1C);
        const fog = new THREE.FogExp2(0x1C1C1C, 0.01);
        scene.fog = fog;

        // Setup blobs
        // const blobsState = createBlobs(scene);
        // moduleBlobsRef = blobsState;

        return () => {
        };
    }, [scene, agentsRef]);

    return null;
};

// Lights Component
const Lights = () => {
    const lightRef = useRef();
    const lightColor = new THREE.Color(0x1E7D01);
    useHelper(lightRef, THREE.PointLightHelper, 0.5);
    return (
        <>
            <directionalLight position={[-1, 0, 1]} intensity={0.5} color={lightColor} />
            <directionalLight position={[1, 0, 1]} intensity={0.5} color={lightColor} />
            {/* <ambientLight intensity={0.3} color={lightColor} /> */}
            {/* <rectAreaLight
                position={[5, 0, 0]}
                width={10}
                height={10}
                intensity={20}
                color={lightColor}
                lookAt={[0, 0, 0]}
            /> */}
            <Stars radius={100} depth={100} count={5000} factor={4} saturation={0} fade speed={1} />
            {/* <RandomizedLight color={lightColor} castShadow radius={5} intensity={5} amount={8} frames={100} position={[5, 5, -10]} /> */}
            <pointLight ref={lightRef} position={[0, 0, 0]} intensity={5} distance={100} color={lightColor} />
            {/* <pointLight ref={lightRef} position={[0, 5, 0]} intensity={5} distance={100} color={lightColor} /> */}
            {/* <pointLight ref={lightRef} position={[5, 0, 0]} intensity={5} distance={100} color={lightColor} /> */}
            {/* <pointLight ref={lightRef} position={[-5, 0, 0]} intensity={5} distance={100} color={lightColor} /> */}
        </>
    );
};

const messages = [
    'Normal operation...', // default nothing happens
    'Identifying user...', // phone connection detected - duration:5 sec, then go to default message
    'Processing request...', // when sends data from phone
    'Analysing data...', // after previous message
    'Generating output...', // When new agents are being spawned
    '! System overload...!', // when many agents are alive (300), when many users are connected (3)
    '! System failure...!', // when too manu agents are alive (450), when too many users are connected (4)
    'Rebooting...', // when system failure happens "restarting", duration: 10 sec, then go to default message 
]

const PROCESSING_DURATION_MS = 2000;
const ANALYSING_DURATION_MS = 2000;
const OVERLOAD_AGENT_THRESHOLD = 300;
const OVERLOAD_PHONE_THRESHOLD = 3;

// Animation Loop Component
const AnimationController = ({ agentsRef }) => {
    const { scene } = useThree();
    const startTimeRef = useRef(Date.now());

    useFrame(() => {
        // if (moduleBlobsRef) {
        //     animateBlobs(moduleBlobsRef, performance.now());
        // }

        if (agentsRef.current) {
            animateCluster(scene, agentsRef.current, performance.now());

            const popControlGen = populationControl(scene, agentsRef.current);
            if (popControlGen > 0) {
                generationTracker.fromPopulationControl += popControlGen;
                generationTracker.total += popControlGen;
                generatingUntil = Math.max(generatingUntil, Date.now() + 2500);
            }

            const aliveAgents = agentsRef.current.filter(agent => !agent.isDead).length;
            const deadAgents = agentsRef.current.filter(agent => agent.isDead).length;
            const totalAgents = agentsRef.current.length;

            const aliveAgentsList = agentsRef.current.filter(agent => !agent.isDead);
            const totalEnergy = aliveAgentsList.reduce((sum, agent) => sum + (agent.energy || 0), 0);
            const avgEnergy = aliveAgents > 0 ? (totalEnergy / aliveAgents).toFixed(2) : 0;
            const totalHealthScore = aliveAgentsList.reduce((sum, agent) => sum + (agent.dna?.healthScore || 0), 0);
            const avgHealthScore = aliveAgents > 0 ? (totalHealthScore / aliveAgents).toFixed(2) : 0;

            // Calculate elapsed time
            const elapsedMs = Date.now() - startTimeRef.current;
            const elapsedSeconds = Math.floor(elapsedMs / 1000);
            const hours = Math.floor(elapsedSeconds / 3600);
            const minutes = Math.floor((elapsedSeconds % 3600) / 60);
            const seconds = elapsedSeconds % 60;
            const timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Get dominant colors
            const dominantColors = getDominantColors(aliveAgentsList);
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
                    <div>${generationTracker.total}</div>
                    <div>${generationTracker.fromPopulationControl}</div>
                    <div>${generationTracker.fromUserInput}</div>
                `;
            }
            const $colorDomEl = document.getElementById('color-dom');
            if ($colorDomEl) {
                $colorDomEl.innerHTML = `
                    ${colorHtml}
                `;
            }
            const $timeCounter = document.getElementById('time');
            if ($timeCounter) {
                $timeCounter.innerHTML = `
                <div>${timeString}</div>
                `;
            }

            const $message = document.getElementById('message');
            if ($message) {
                const now = Date.now();
                const isOverloaded = aliveAgents >= OVERLOAD_AGENT_THRESHOLD || connectedPhones >= OVERLOAD_PHONE_THRESHOLD;
                const activeMessage = isOverloaded
                    ? messages[5]
                    : now < processingUntil
                        ? messages[2]
                        : now < analysingUntil
                            ? messages[3]
                            : now < generatingUntil
                                ? messages[4]
                                : now < identificationUntil
                                    ? messages[1]
                                    : messages[0];
                $message.innerHTML = `
                    <div>${activeMessage}</div>
                `;
            }

        }
    });

    return null;
};

// Agents Component
const Agents = ({ agentsRef }) => {
    const { scene } = useThree();

    useEffect(() => {
        (async () => {
            const agents = await cubeCluster(scene, 150);
            agentsRef.current = agents;
        })();
    }, [scene, agentsRef]);

    return null;
};

// Main Scene Component
const Scene = ({ agentsRef }) => {
    return (
        <>
            <PerspectiveCamera position={[0, 0, 9]} fov={40} makeDefault />
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
            </EffectComposer>
        </>
    );
};

// Handle remote data
const handleRemoteData = (data, startDelayMs = 0) => {
    if (!data || !moduleAgentsRef?.current || !moduleSceneRef?.current) return;

    const inputDNA = {
        widthExt: data.widthExt || Math.random() * 0.5,
        heightExt: data.heightExt || Math.random() * 0.5,
        depthExt: data.depthExt || Math.random() * 0.5,
        color: data.hex ? new THREE.Color(data.hex) : new THREE.Color('#c2260a'),
        speed: data.speed || Math.random() * 0.02,
        opacity: data.opacity || Math.max(0.2, Math.random()),
        metalness: data.metalness || Math.random(),
        healthScore: data.healthScore || Math.random() * 100,
        mass: data.mass || Math.random() * 10,
    };
    const generatedCount = inputLife(moduleSceneRef.current, moduleAgentsRef.current, inputDNA, startDelayMs);
    if (generatedCount > 0) {
        generationTracker.fromUserInput += generatedCount;
        generationTracker.total += generatedCount;
    }
};

socket.on('render-data', (data) => {
    console.log('Display received data:', data);
    const now = Date.now();
    const generatingStartDelay = PROCESSING_DURATION_MS + ANALYSING_DURATION_MS;
    const spawnBurstDuration = (INPUT_SPAWN_COUNT - 1) * INPUT_SPAWN_DELAY_MS + 1000;

    processingUntil = now + PROCESSING_DURATION_MS;
    analysingUntil = now + generatingStartDelay;
    generatingUntil = now + generatingStartDelay + spawnBurstDuration;
    handleRemoteData(data, generatingStartDelay);
});

socket.on('remote-count', (count) => {
    const safeCount = Number.isFinite(count) ? count : 0;
    if (safeCount > lastConnectedPhones) {
        identificationUntil = Date.now() + 3000;
    }
    connectedPhones = safeCount;
    lastConnectedPhones = safeCount;
});

// Display Component
const Display = () => {
    const agentsRef = useRef(null);

    useEffect(() => {
        console.log('Display component mounted');
        socket.emit('join-display');

        return () => {
            // Cleanup
        };
    }, []);

    return (
        <>
            <Canvas
                gl={{ antialias: true }}
                style={{ width: '100vw', height: '100vh' }}
            >

                <Scene agentsRef={agentsRef} />
                {/* <Environment preset="warehouse" background /> */}
            </Canvas>
            <HealthDiagram agentsRef={agentsRef} />
            <MovementHeatmap agentsRef={agentsRef} />
        </>
    );
};

// Render
const $root = ReactDOM.createRoot(document.getElementById('root'));
$root.render(
    <React.StrictMode>
        <Display />
    </React.StrictMode>
);

