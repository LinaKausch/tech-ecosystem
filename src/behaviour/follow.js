import * as THREE from 'three';

export const follow = (agent, dt) => {
    if (!agent.target) return new THREE.Vector3(0, 0, 0);

    const parentPos = agent.target.position;
    const desired = new THREE.Vector3().subVectors(parentPos, agent.position);
    const distance = desired.length();

    const safeDistance = 0.5;

    if (distance < safeDistance) {
        return new THREE.Vector3(0, 0, 0);
        // agent.position.add(agent.movement.velocity);
        return;
    }

    const speed = agent.movement.speed * 100;
   return desired.normalize().multiplyScalar(speed);

}