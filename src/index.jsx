import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as THREE from 'three';
import { blobs as createBlobs, animateBlobs } from './particles/blobs.js';
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

const Scene = ({ sceneRef, agentsRef }) => {
    const { scene, camera, gl } = useThree();
    const controlsRef = useRef(null);
    const blobsStateRef = useRef(null);
    const composerRef = useRef(null);

    //INITIAL SETUP
    useEffect(() => {
        sceneRef.current = scene;
        moduleSceneRef = sceneRef;

        // SETUP BLOOM POST-PROCESSING
        const composer = new EffectComposer(gl);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(gl.domElement.clientWidth, gl.domElement.clientHeight),
            0.05, // strength - increased
            0.5, // radius - increased
            0.05 // threshold - lowered so emissive materials glow
        );
        composer.addPass(bloomPass);
        composerRef.current = composer;

        scene.background = new THREE.Color(0x000000);

        // SETUP BLOBS
        const blobsState = createBlobs(scene);
        blobsStateRef.current = blobsState;

        // SETUP LIGHTING
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);

        // DIRECTIONAL LIGHTS
       

        // const directional2 = new THREE.DirectionalLight(0x002000, 20);
        // directional2.position.set(-10, 0, 7.5);
        // directional2.target.position.set(0, 0, 0);
        // scene.add(directional2);

        const directionalTop = new THREE.DirectionalLight(0x0021FF, 5);
        directionalTop.position.set(0, 10, 0);
        directionalTop.target.position.set(0, 0, 0);
        scene.add(directionalTop);

        const directionalFrontLeft = new THREE.DirectionalLight(0x001B6E, 2);
        directionalFrontLeft.position.set(5, 0, 10);
        directionalFrontLeft.target.position.set(0, 0, 0);
        scene.add(directionalFrontLeft);

          const directionalFrontRight = new THREE.DirectionalLight(0x007047, 2);
        directionalFrontRight.position.set(-5, 0, 10);
        directionalFrontRight.target.position.set(0, 0, 0);
        scene.add(directionalFrontRight);

                 const directionalBackRight = new THREE.DirectionalLight(0x007047, 2);
        directionalBackRight.position.set(-5, 0, -10);
        directionalBackRight.target.position.set(0, 0, 0);
        scene.add(directionalBackRight);

        //CAMERA AND CONTROLS
        camera.position.set(0, 0, 9);
        const controls = new OrbitControls(camera, gl.domElement);
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI / 2;
        controls.enableDamping = true;
        controls.target.set(0, 0, 0);
        controlsRef.current = controls;

        //CORE
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

        if (blobsStateRef.current) {
            animateBlobs(blobsStateRef.current, performance.now());
        }

       if (composerRef.current) {
        gl.clear();
        composerRef.current.render();
        }

        if (agentsRef.current) {
            animateCluster(scene, agentsRef.current, performance.now());
            populationControl(scene, agentsRef.current);

            const aliveAgents = agentsRef.current.filter(agent => !agent.isDead).length;
            const deadAgents = agentsRef.current.filter(agent => agent.isDead).length;
            const totalAgents = agentsRef.current.length;

            const aliveAgentsList = agentsRef.current.filter(agent => !agent.isDead);
            const totalHealthScore = aliveAgentsList.reduce((sum, agent) => sum + (agent.dna?.healthScore || 0), 0);
            const avgHealthScore = aliveAgents > 0 ? (totalHealthScore / aliveAgents).toFixed(2) : 0;

            const statsEl = document.getElementById('stats');
            if (statsEl) {
                statsEl.innerHTML = `
                    <div>Alive: ${aliveAgents}</div>
                    <div>Dead: ${deadAgents}</div>
                    <div>Total: ${totalAgents}</div>
                    <div>Avg Health: ${avgHealthScore}</div>
                `;
            }
        }
    }, 1);

    return null;
};

//INPUT HANDLER
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

    useEffect(() => {
        console.log('Display component mounted');
        socket.emit('join-display');

        return () => {
        };
    }, []);

    return (
        <Canvas
            gl={{ antialias: true }}
            onCreated={({ gl }) => {
                gl.autoClear = false;
            }}
            style={{ width: '100vw', height: '100vh' }}
            camera={{ position: [0, 0, 9], fov: 40 }}
        >
            <Scene sceneRef={sceneRef} agentsRef={agentsRef} />
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

