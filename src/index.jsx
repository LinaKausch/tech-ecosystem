import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { blobs, animateBlobs } from './particles/blobs.js';
import { cubeCluster, animateCluster } from './components/three/cubes.js';
import { populationControl, inputLife } from './components/three/evolution.js';
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

let moduleSceneRef = null;
let moduleAgentsRef = null;

const Scene = ({ sceneRef, agentsRef, blobsStateRef }) => {
    const { scene, camera, gl } = useThree();
    const controlsRef = useRef(null);

    //INITIAL SETUP
    useEffect(() => {
        sceneRef.current = scene;
        moduleSceneRef = sceneRef;

        // SETUP LIGHTING
        const ambient = new THREE.AmbientLight(0xffffff, 2);
        scene.add(ambient);

        // DIRECTIONAL LIGHTS
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

        //CAMERA AND CONTROLS
        camera.position.set(0, 0, 9);
        const controls = new OrbitControls(camera, gl.domElement);
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI / 2;
        controls.enableDamping = true;
        controls.target.set(0, 0, 0);
        controlsRef.current = controls;

        //CORE
        const blobsState = blobs(scene);
        blobsStateRef.current = blobsState;

        //AGENTS
        const agents = cubeCluster(scene, 100);
        agentsRef.current = agents;
        moduleAgentsRef = agentsRef;

        return () => {
            controls.dispose();
        };
    }, [scene, camera, gl]);

    // ANIMATION LOOP
    useFrame(() => {
        if (controlsRef.current) controlsRef.current.update();

        if (agentsRef.current && blobsStateRef.current) {
            animateCluster(scene, agentsRef.current, performance.now());
            animateBlobs(blobsStateRef.current, performance.now());
            populationControl(scene, agentsRef.current);

            const aliveAgents = agentsRef.current.filter(agent => !agent.isDead).length;
            const deadAgents = agentsRef.current.filter(agent => agent.isDead).length;
            const totalAgents = agentsRef.current.length;

            const statsEl = document.getElementById('stats');
            if (statsEl) {
                statsEl.innerHTML = `
                    <div>Alive: ${aliveAgents}</div>
                    <div>Dead: ${deadAgents}</div>
                    <div>Total: ${totalAgents}</div>
                `;
            }
        }
    });

    return null;
};

//INPUT HANDLER
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
};

socket.on('render-data', (data) => {
    console.log('Display received data:', data);
    handleRemoteData(data);
});

// MAIN DISPLAY COMPONENT
const Display = () => {
    const sceneRef = useRef(null);
    const agentsRef = useRef(null);
    const blobsStateRef = useRef(null);

    useEffect(() => {
        console.log('Display component mounted');
        socket.emit('join-display');

        return () => {
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

// RENDER
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Display />
    </React.StrictMode>
);

