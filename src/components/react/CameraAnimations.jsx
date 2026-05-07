import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as System from '../../world/system.jsx';

export const CameraAnimations = () => {
    const { camera } = useThree();
    const target = new THREE.Vector3(0, 0, 0);
    const angleRef = useRef(0);
    const collapseStartPosRef = useRef(null);
    const recoveryFromPosRef = useRef(null);
    const prevCameraStateRef = useRef(null);
    const transitionStartTimeRef = useRef(null);
    const transitionFromPosRef = useRef(null);
    const IDLE_BASE_RADIUS = 11;
    const IDLE_RADIUS_AMPLITUDE = 3;
    const IDLE_RADIUS_SPEED = 0.25;
    const TRANSITION_DURATION = 1.5;
    const glitchRef = useRef(false);

    useFrame((state, delta) => {
        const currentIdleRadius =
            IDLE_BASE_RADIUS + Math.sin(state.clock.elapsedTime * IDLE_RADIUS_SPEED) * IDLE_RADIUS_AMPLITUDE;

        // Detect state change and start transition
        if (prevCameraStateRef.current !== System.systemState.currentCameraState) {
            const isIdleToOverloadTransition =
                (prevCameraStateRef.current === System.camera_States.IDLE || prevCameraStateRef.current === null) &&
                System.systemState.currentCameraState === System.camera_States.OVERLOAD;

            const isOverloadToIdleTransition =
                prevCameraStateRef.current === System.camera_States.OVERLOAD &&
                System.systemState.currentCameraState === System.camera_States.IDLE;

            if (isIdleToOverloadTransition || isOverloadToIdleTransition) {
                transitionStartTimeRef.current = Date.now();
                transitionFromPosRef.current = camera.position.clone();
            }
            prevCameraStateRef.current = System.systemState.currentCameraState;
        }

        switch (System.systemState.currentCameraState) {
            case System.camera_States.IDLE:
                // Calculate target position for IDLE state
                angleRef.current += delta * 0.1;
                const idleTargetX = Math.sin(angleRef.current) * currentIdleRadius;
                const idleTargetZ = Math.cos(angleRef.current) * currentIdleRadius;
                const idleTargetY = Math.sin(angleRef.current * 0.5) * currentIdleRadius;
                const idleTarget = new THREE.Vector3(idleTargetX, idleTargetY, idleTargetZ);

                // Check if transitioning from OVERLOAD
                if (transitionStartTimeRef.current && transitionFromPosRef.current) {
                    const elapsed = Date.now() - transitionStartTimeRef.current;
                    const progress = Math.min(elapsed / (TRANSITION_DURATION * 1000), 1);
                    camera.position.lerpVectors(transitionFromPosRef.current, idleTarget, progress);
                    if (progress >= 1) {
                        transitionStartTimeRef.current = null;
                        transitionFromPosRef.current = null;
                    }
                } else {
                    camera.position.copy(idleTarget);
                }
                System.systemState.glitch = false;
                break;
            case System.camera_States.GENERATING:
                // Fixed generating position
                const generatingFixedPos = new THREE.Vector3(10, 10, 10);
                
                
                // Apply slight shake
                const shakeIntensity = 0.05;
                const shakeX = (Math.random() - 0.5) * shakeIntensity;
                const shakeY = (Math.random() - 0.5) * shakeIntensity;
                const shakeZ = (Math.random() - 0.5) * shakeIntensity;
                
                camera.position.x = generatingFixedPos.x + shakeX;
                camera.position.y = generatingFixedPos.y + shakeY;
                camera.position.z = generatingFixedPos.z + shakeZ;
                
                console.log(`✓ Camera position is now: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`);
                System.systemState.glitch = false;
                break;

            case System.camera_States.OVERLOAD:
                angleRef.current += delta * 0.3;

                const overloadBaseX = Math.sin(angleRef.current) * 18;
                const overloadBaseZ = Math.cos(angleRef.current) * 18;
                const overloadBaseY = Math.sin(angleRef.current * 0.5) * 18;

                // Base position without shake for smooth transitions
                const overloadBasePosition = new THREE.Vector3(overloadBaseX, overloadBaseY, overloadBaseZ);

                // Check if transitioning from IDLE
                if (transitionStartTimeRef.current && transitionFromPosRef.current) {
                    const elapsed = Date.now() - transitionStartTimeRef.current;
                    const progress = Math.min(elapsed / (TRANSITION_DURATION * 1000), 1);
                    camera.position.lerpVectors(transitionFromPosRef.current, overloadBasePosition, progress);
                    if (progress >= 1) {
                        transitionStartTimeRef.current = null;
                        transitionFromPosRef.current = null;
                    }
                } else {
                    // After transition, apply shake to the base position
                    const overloadShakeIntensity = 0.2;
                    const overloadShakeX = (Math.random() - 0.5) * overloadShakeIntensity;
                    const overloadShakeY = (Math.random() - 0.5) * overloadShakeIntensity;
                    const overloadShakeZ = (Math.random() - 0.5) * overloadShakeIntensity;

                    camera.position.x = overloadBaseX + overloadShakeX;
                    camera.position.y = overloadBaseY + overloadShakeY;
                    camera.position.z = overloadBaseZ + overloadShakeZ;
                }
                System.systemState.glitch = true;
                break;
            case System.camera_States.FAILURE:
                const collapseElapsedTime = Date.now() - System.systemState.collapseStartTime;
                const collapseProg = Math.min(collapseElapsedTime / System.COLLAPSE_ANIMATION_DURATION, 1);
                if (!collapseStartPosRef.current) {
                    collapseStartPosRef.current = camera.position.clone();
                }
                recoveryFromPosRef.current = null;

                const zoomProg = Math.min(collapseProg / 0.4, 1);
                const direction = collapseStartPosRef.current.clone().normalize();
                const distance = collapseStartPosRef.current.length();
                const newDistance = distance + (zoomProg * 200);

                camera.position.copy(direction.multiplyScalar(newDistance));
                System.systemState.glitch = false;
                break;
            case System.camera_States.REBOOT:
                if (collapseStartPosRef.current) {
                    const direction = collapseStartPosRef.current.clone().normalize();
                    const finalDistance = collapseStartPosRef.current.length() + 200;
                    camera.position.copy(direction.multiplyScalar(finalDistance));
                }
                System.systemState.glitch = false;
                break;
            case System.camera_States.RECOVERING:
                if (!recoveryFromPosRef.current) {
                    recoveryFromPosRef.current = camera.position.clone();
                }

                const recoveryElapsed = Date.now() - System.systemState.recoveryStartTime;
                const recoveryProg = Math.min(recoveryElapsed / System.RECOVERY_ZOOM_DURATION, 1);
                const recoveryIdleTarget = new THREE.Vector3(
                    Math.sin(angleRef.current) * currentIdleRadius,
                    Math.sin(angleRef.current * 0.5) * currentIdleRadius,
                    Math.cos(angleRef.current) * currentIdleRadius
                );
                camera.position.lerpVectors(recoveryFromPosRef.current, recoveryIdleTarget, recoveryProg);
                if (recoveryProg >= 1) {
                    System.finishRecovery();
                    collapseStartPosRef.current = null;
                    recoveryFromPosRef.current = null;
                }
                System.systemState.glitch = false;
                break;
        }
        camera.lookAt(target);
    });
    return null;
};
