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
    const IDLE_BASE_RADIUS = 10;
    const IDLE_RADIUS_AMPLITUDE = 3;
    const IDLE_RADIUS_SPEED = 0.25;

    useFrame((state, delta) => {
        const currentIdleRadius =
            IDLE_BASE_RADIUS + Math.sin(state.clock.elapsedTime * IDLE_RADIUS_SPEED) * IDLE_RADIUS_AMPLITUDE;

        switch (System.systemState.currentCameraState) {
            case System.camera_States.IDLE:
                angleRef.current += delta * 0.1;
                camera.position.x = Math.sin(angleRef.current) * currentIdleRadius;
                camera.position.z = Math.cos(angleRef.current) * currentIdleRadius;
                camera.position.y = Math.sin(angleRef.current * 0.5) * currentIdleRadius;
                break;
            case System.camera_States.GENERATING:
                const shakeIntensity = 0.05;
                const shakeX = (Math.random() - 0.5) * shakeIntensity;
                const shakeY = (Math.random() - 0.5) * shakeIntensity;
                const shakeZ = (Math.random() - 0.5) * shakeIntensity;
                camera.position.x += shakeX;
                camera.position.y += shakeY;
                camera.position.z += shakeZ;
                break;
            case System.camera_States.OVERLOAD:
                angleRef.current += delta * 0.3;

                const overloadBaseX = Math.sin(angleRef.current) * 11;
                const overloadBaseZ = Math.cos(angleRef.current) * 11;
                const overloadBaseY = Math.sin(angleRef.current * 0.5) * 11;

                const overloadShakeIntensity = 0.1;
                const overloadShakeX = (Math.random() - 0.5) * overloadShakeIntensity;
                const overloadShakeY = (Math.random() - 0.5) * overloadShakeIntensity;
                const overloadShakeZ = (Math.random() - 0.5) * overloadShakeIntensity;

                camera.position.x = overloadBaseX + overloadShakeX;
                camera.position.y = overloadBaseY + overloadShakeY;
                camera.position.z = overloadBaseZ + overloadShakeZ;
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
                break;
            case System.camera_States.REBOOT:
                if (collapseStartPosRef.current) {
                    const direction = collapseStartPosRef.current.clone().normalize();
                    const finalDistance = collapseStartPosRef.current.length() + 200;
                    camera.position.copy(direction.multiplyScalar(finalDistance));
                }
                break;
            case System.camera_States.RECOVERING:
                if (!recoveryFromPosRef.current) {
                    recoveryFromPosRef.current = camera.position.clone();
                }

                const recoveryElapsed = Date.now() - System.systemState.recoveryStartTime;
                const recoveryProg = Math.min(recoveryElapsed / System.RECOVERY_ZOOM_DURATION, 1);
                const idleTarget = new THREE.Vector3(
                    Math.sin(angleRef.current) * currentIdleRadius,
                    Math.sin(angleRef.current * 0.5) * currentIdleRadius,
                    Math.cos(angleRef.current) * currentIdleRadius
                );
                camera.position.lerpVectors(recoveryFromPosRef.current, idleTarget, recoveryProg);
                if (recoveryProg >= 1) {
                    System.finishRecovery();
                    collapseStartPosRef.current = null;
                    recoveryFromPosRef.current = null;
                }
                break;
        }
        camera.lookAt(target);
    });
    return null;
};
