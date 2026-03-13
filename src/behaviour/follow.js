import * as THREE from 'three';

export const follow = (agent, dt) => {
    if (!agent.target) return new THREE.Vector3(0, 0, 0);

    if (agent.movement.orbitAngle == null) {
        agent.movement.orbitAngle = Math.random() * Math.PI * 2;
    }

    const parentPos = agent.target.position;
    const orbitRadius = 1;
    const orbitSpeed = 0.03;
    const verticalWave = 0.15;

    agent.movement.orbitAngle += orbitSpeed;

    const desiredPos = new THREE.Vector3(
        parentPos.x + Math.cos(agent.movement.orbitAngle) * orbitRadius,
        parentPos.y + Math.sin(agent.movement.orbitAngle * 2) * verticalWave,
        parentPos.z + Math.sin(agent.movement.orbitAngle) * orbitRadius
    );

    const desiredVelocity = desiredPos.sub(agent.position);
    if (desiredVelocity.lengthSq() === 0) {
        return new THREE.Vector3(0, 0, 0);
    }

    const speed = agent.movement.speed * 120;
    return desiredVelocity.normalize().multiplyScalar(speed);

}