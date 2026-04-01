import * as THREE from 'three';
import React, { useLayoutEffect } from 'react';
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const Blobs = ({ options = {} }) => {
    const {
        count = 15,
        spread = 5
    } = options;

    const blobsRef = useRef(null);
    const stateRef = useRef({
        blobs: null,
        particles: [],
        spread,
        lastTime: null
    });

    useEffect(() => {
        const resolution = 64;

        // Create MarchingCubes with a temporary material
        const blobs = new MarchingCubes(resolution, new THREE.MeshBasicMaterial({ visible: false }), false, true);
        blobs.position.set(0, 0, 0);
        const cubeScale = 0.9;
        blobs.scale.set(cubeScale, cubeScale, cubeScale);
        blobs.isolation = 20;

        const particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * spread,
                    (Math.random() - 0.5) * spread,
                    (Math.random() - 0.5) * spread
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                )
            });
        }

        stateRef.current = { blobs, particles, spread, lastTime: null };
        blobsRef.current = blobs;

        return () => {
            blobs.material?.dispose();
            blobs.geometry?.dispose();
        };
    }, [count, spread]);

    useLayoutEffect(() => {
        if (blobsRef.current && blobsRef.current.parent === null) {
            // Material will be replaced by MeshTransmissionMaterial in JSX
        }
    }, []);

    useFrame((state, delta) => {
        const { blobs, particles, spread } = stateRef.current;
        if (!blobs || !particles) return;

        const time = state.clock.getElapsedTime();
        const dt = Math.min(delta, 0.05);
        stateRef.current.lastTime = time;

        const strength = 0.09;
        const subtract = 3;

        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            particle.position.addScaledVector(particle.velocity, dt * 60);

            ['x', 'y', 'z'].forEach(axis => {
                if (particle.position[axis] < -spread / 2 || particle.position[axis] > spread / 2) {
                    particle.velocity[axis] *= -1;
                    particle.position[axis] = THREE.MathUtils.clamp(particle.position[axis], -spread / 2, spread / 2);
                }
            });
        }

        blobs.reset();

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            const x = (p1.position.x / spread) * 0.5 + 0.5;
            const y = (p1.position.y / spread) * 0.5 + 0.5;
            const z = (p1.position.z / spread) * 0.5 + 0.5;

            blobs.addBall(x, y, z, strength, subtract);
        }

        blobs.update();
    });

    return (
        <group>
            {blobsRef.current && (
                <primitive object={blobsRef.current}>
                    <MeshTransmissionMaterial
                        // attach="material"
                        // resolution={64}
                        // transmission={1}
                        // roughness={0}
                        // thickness={1}
                        // ior={2}
                        // backside={true}
                        // backsideThickness={0.5}
                        // chromaticAberration={0.1}
                        // anisotropy={0.1}
                        backside
                        samples={10}
                        thickness={0.5}
                        chromaticAberration={0.05}
                        anisotropicBlur={0.1}
                        clearcoat={1}
                        roughness={0}
                    />
                </primitive>
            )}
        </group>
    );
};

export default Blobs;
