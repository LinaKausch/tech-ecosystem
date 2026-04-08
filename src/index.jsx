import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls as OrbitControlsComponent, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { blobs as createBlobs, animateBlobs } from './particles/blobs.js';
import { cubeCluster, animateCluster } from './components/three/cubes.js';
import { populationControl, inputLife } from './components/three/evolution.js';
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
    return (
        <pointLight position={[0, 0, 0]} intensity={2} distance={100} color={0x1E7D01} />
    );
};

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
                    <div style="width: 20px; height: 20px; background-color: ${c.hex}; border: 1px solid #666; border-radius: 2px;"></div>
                    <span>${c.hex} (${c.count})</span>
                </div>`
            ).join('');

            const statsEl = document.getElementById('stats');
            if (statsEl) {
                statsEl.innerHTML = `
                    <div>Runtime: ${timeString}</div>
                    <div>Alive: ${aliveAgents}</div>
                    <div>Dead: ${deadAgents}</div>
                    <div>Total: ${totalAgents}</div>
                    <div>Avg Health: ${avgHealthScore}</div>
                    <div>Avg Energy: ${avgEnergy}</div>
                    <div>Generations: ${generationTracker.total}</div>
                    <div>Population Gen: ${generationTracker.fromPopulationControl}</div>
                    <div>User Input Gen: ${generationTracker.fromUserInput}</div>
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #666;">
                        <div style="font-weight: bold; margin-bottom: 5px;">Dominant Colors:</div>
                        ${colorHtml}
                    </div>
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
            const agents = await cubeCluster(scene, 100);
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
                    luminanceThreshold={1}
                    luminanceSmoothing={1}
                    height={500}
                    intensity={5}
                    mipmapBlur={true}
                />
            </EffectComposer>
        </>
    );
};

// Handle remote data
const handleRemoteData = (data) => {
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
    const generatedCount = inputLife(moduleSceneRef.current, moduleAgentsRef.current, inputDNA);
    if (generatedCount > 0) {
        generationTracker.fromUserInput += generatedCount;
        generationTracker.total += generatedCount;
    }
};

socket.on('render-data', (data) => {
    console.log('Display received data:', data);
    handleRemoteData(data);
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
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Display />
    </React.StrictMode>
);

