import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { blobs, animateBlobs } from './particles/blobs.js';
import { cubeCluster, animateCluster } from './components/three/cubes.js';
import { populationControl, inputLife } from './components/three/evolution.js';
import './style.css';

console.log('%c=== INDEX.JSX LOADING ===', 'color: green; font-size: 16px;');
console.log('socket.io available?', typeof window.io !== 'undefined');
console.log('qrcode available?', typeof window.qrcode !== 'undefined');

const socket = window.io();

console.log('Socket created:', socket);

// Disconnect any existing listeners first
socket.off();

// Set up socket listeners
socket.on('connect', () => {
    console.log('%c✓ SOCKET CONNECTED', 'color: green; font-weight: bold;', 'ID:', socket.id);

    const url = `${new URL(`remote.html?id=${socket.id}`, window.location)}`;
    console.log('Generated URL:', url);

    // Get DOM elements
    const $url = document.getElementById('url');
    const $qr = document.getElementById('qr');

    console.log('DOM elements:', { url: !!$url, qr: !!$qr });

    if ($url) {
        $url.textContent = url;
        $url.setAttribute('href', url);
    }

    // Generate QR code
    if (typeof window.qrcode !== 'function') {
        console.error('❌ qrcode library not available');
        return;
    }

    try {
        const qr = window.qrcode(4, 'L');
        qr.addData(url);
        qr.make();
        const qrHtml = qr.createImgTag(4);

        if ($qr) {
            $qr.innerHTML = qrHtml;
            console.log('%c✓✓✓ QR CODE GENERATED', 'color: green; font-weight: bold;');
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

// Store module-level refs for socket listeners
let moduleSceneRef = null;
let moduleAgentsRef = null;

// Three.js scene component
const Scene = ({ sceneRef, agentsRef, blobsStateRef }) => {
    const { scene, camera, gl } = useThree();
    const controlsRef = useRef(null);

    useEffect(() => {
        sceneRef.current = scene;
        // Update module-level ref for socket listener
        moduleSceneRef = sceneRef;

        // Setup lighting
        const ambient = new THREE.AmbientLight(0xffffff, 2);
        scene.add(ambient);

        // Directional lights
        // const directional = new THREE.DirectionalLight(0x220000, 200);
        // directional.position.set(10, 0, 7.5);
        // directional.target.position.set(0, 0, 0);
        // scene.add(directional);

        // const directional2 = new THREE.DirectionalLight(0x002000, 200);
        // directional2.position.set(-10, 0, 7.5);
        // directional2.target.position.set(0, 0, 0);
        // scene.add(directional2);

        // const directionalTop = new THREE.DirectionalLight(0x0021FF, 200);
        // directionalTop.position.set(0, 10, 0);
        // directionalTop.target.position.set(0, 0, 0);
        // scene.add(directionalTop);

        // const directionalFront = new THREE.DirectionalLight(0x220000, 200);
        // directionalFront.position.set(0, 0, 10);
        // directionalFront.target.position.set(0, 0, 0);
        // scene.add(directionalFront);

        // Setup camera
        camera.position.set(0, 0, 9);

        // Setup controls
        const controls = new OrbitControls(camera, gl.domElement);
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI / 2;
        controls.enableDamping = true;
        controls.target.set(0, 0, 0);
        controlsRef.current = controls;

        // Initialize agents and blobs
        const blobsState = blobs(scene);
        blobsStateRef.current = blobsState;

        const agents = cubeCluster(scene, 100);
        agentsRef.current = agents;
        // Update module-level ref for socket listener
        moduleAgentsRef = agentsRef;

        return () => {
            controls.dispose();
        };
    }, [scene, camera, gl]);

    // Animation loop
    useFrame(() => {
        if (controlsRef.current) controlsRef.current.update();

        if (agentsRef.current && blobsStateRef.current) {
            animateCluster(scene, agentsRef.current, performance.now());
            animateBlobs(blobsStateRef.current, performance.now());
            populationControl(scene, agentsRef.current);

            // Update stats display
            const aliveAgents = agentsRef.current.filter(agent => !agent.isDead).length;
            const deadAgents = agentsRef.current.filter(agent => agent.isDead).length;
            const totalAgents = agentsRef.current.length;

            const statsEl = document.getElementById('stats');
            if (statsEl) {
                statsEl.innerHTML = `
                    <div>🟢 Alive: ${aliveAgents}</div>
                    <div>🔴 Dead: ${deadAgents}</div>
                    <div>📊 Total: ${totalAgents}</div>
                `;
            }
        }
    });

    return null;
};

// Handle remote data at module level
const handleRemoteData = (data) => {
    if (!data || !data.hex || !moduleAgentsRef?.current || !moduleSceneRef?.current) return;

    const inputDNA = {
        widthExt: Math.random() * 0.5,
        heightExt: Math.random() * 0.5,
        depthExt: Math.random() * 0.5,
        color: new THREE.Color(data.hex),
        speed: Math.random() * 0.02,
        opacity: Math.max(0.2, Math.random()),
        metalness: Math.random(),
        healthScore: Math.random() * 100,
        mass: Math.random() * 10,
    };

    inputLife(moduleSceneRef.current, moduleAgentsRef.current, inputDNA);
    console.log('Created agents with color:', data.hex);
};

// Set up render-data listener at module level
socket.on('render-data', (data) => {
    console.log('Display performing action:', data.hex);
    handleRemoteData(data);
});

// Main Display component
const Display = () => {
    const sceneRef = useRef(null);
    const agentsRef = useRef(null);
    const blobsStateRef = useRef(null);

    useEffect(() => {
        console.log('Display component mounted');
        socket.emit('join-display');

        return () => {
            // Don't disconnect on unmount
        };
    }, []);

    return (
        <Canvas
            style={{ width: '100vw', height: '100vh' }}
            camera={{ position: [0, 0, 9], fov: 40 }}
        >
            <Scene sceneRef={sceneRef} agentsRef={agentsRef} blobsStateRef={blobsStateRef} />
        </Canvas>
    );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Display />
    </React.StrictMode>
);

// Hot module replacement
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        socket.disconnect();
    });
}
