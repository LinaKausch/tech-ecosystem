import * as THREE from 'three';

export const wander = (agent, dt) => {
    const move = agent.movement;
    const now = 0.4;

    // const circleCenter = move.velocity.clone().normalize().multiplyScalar(move.circleDistance);
    // move.direction += move.angleChange * 0.2;

    const displacement = new THREE.Vector3(
        // Math.cos(move.direction),
        // Math.sin(move.direction),
        // (Math.random() - 0.5) * 0.5
        (Math.random() - 0.5) * now,
        (Math.random() - 0.5) * now,
        (Math.random() - 0.5) * now
    );
    // ).multiplyScalar(move.circleRadius);

    move.velocity.add(displacement).normalize();
    return move.velocity.clone().multiplyScalar(1);

    // agent.position.add(move.velocity);

    // const borders = 5;
    // const margin = 1;
    // const turn = 0.02;
    // // What about pulling it towards center?
    // if (agent.position.x > borders - margin) move.velocity.x -= turn;
    // if (agent.position.x < -borders + margin) move.velocity.x += turn;

    // if (agent.position.y > borders - margin) move.velocity.y -= turn;
    // if (agent.position.y < -borders + margin) move.velocity.y += turn;

    // if (agent.position.z > borders - margin) move.velocity.z -= turn;
    // if (agent.position.z < -borders + margin) move.velocity.z += turn;

    // return move.velocity.clone();
}