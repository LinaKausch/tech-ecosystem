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

    useFrame((state, delta) => {
        switch (System.systemState.currentCameraState) {
            case System.camera_States.IDLE:
                angleRef.current += delta * 0.1;
                camera.position.x = Math.sin(angleRef.current) * 9;
                camera.position.z = Math.cos(angleRef.current) * 9;
                camera.position.y = Math.sin(angleRef.current * 0.5) * 9;
                break;
            case System.camera_States.GENERATING:
                // Subtle shake during generation
                const shakeIntensity = 0.05;
                const shakeX = (Math.random() - 0.5) * shakeIntensity;
                const shakeY = (Math.random() - 0.5) * shakeIntensity;
                const shakeZ = (Math.random() - 0.5) * shakeIntensity;
                camera.position.x += shakeX;
                camera.position.y += shakeY;
                camera.position.z += shakeZ;
                break;
            case System.camera_States.OVERLOAD:
                angleRef.current += delta * 0.3; // 3x faster than IDLE
                const overloadBaseX = Math.sin(angleRef.current) * 9;
                const overloadBaseZ = Math.cos(angleRef.current) * 9;
                const overloadBaseY = Math.sin(angleRef.current * 0.5) * 9;

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

                // Store initial position on first frame
                if (!collapseStartPosRef.current) {
                    collapseStartPosRef.current = camera.position.clone();
                }
                recoveryFromPosRef.current = null;

                // Zoom out straight away from current position
                const zoomProg = Math.min(collapseProg / 0.4, 1); // Complete in 0.4s
                const direction = collapseStartPosRef.current.clone().normalize();
                const distance = collapseStartPosRef.current.length();
                const newDistance = distance + (zoomProg * 200);

                camera.position.copy(direction.multiplyScalar(newDistance));
                break;
            case System.camera_States.REBOOT:
                // Stay at far position from collapse
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

                // Recover to the current orbit position to avoid a jump when IDLE resumes.
                const idleTarget = new THREE.Vector3(
                    Math.sin(angleRef.current) * 9,
                    Math.sin(angleRef.current * 0.5) * 9,
                    Math.cos(angleRef.current) * 9
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
