import * as THREE from 'three';

const occupied = new Set();
const objectSize = 0.3;
const snap = (v) => Math.round(v / objectSize) * objectSize;

export const floatInit = (object) => {
    const key = `${object.position.x},${object.position.y},${object.position.z}`;
    object.userData.key = key;
    object.userData.state = "idle";
    object.userData.waitUntil = 0;
    occupied.add(key);
    object.userData.target = new THREE.Vector3(
        snap((Math.random() - 0.5) * 6),
        snap((Math.random() - 0.5) * 6),
        snap((Math.random() - 0.5) * 6)
    );
}

export { occupied, objectSize, snap };

export const float = (object, dt) => {

    const target = object.mesh || object;

    if (!target.userData.target) {
        floatInit(target);
    }

    const floatTarget = target.userData.target;
    const speed = 0.005;

    if (target.userData.state === "idle") {
        if (dt < target.userData.waitUntil) {
            return;
        }

        occupied.delete(target.userData.key);
        target.userData.state = "moving";
    }

    const arrived =
        Math.abs(target.position.x - floatTarget.x) < 0.05 &&
        Math.abs(target.position.y - floatTarget.y) < 0.05 &&
        Math.abs(target.position.z - floatTarget.z) < 0.05;

    if (arrived) {
        const key = `${floatTarget.x},${floatTarget.y},${floatTarget.z}`;
        if (!occupied.has(key)) {
            target.userData.key = key;
            occupied.add(key);
            target.userData.state = "idle";
            target.userData.waitUntil = dt + 700;
        }

        target.userData.target.set(
            snap((Math.random() - 0.5) * 6),
            snap((Math.random() - 0.5) * 6),
            snap((Math.random() - 0.5) * 6)
        );
        return;
    }

    if (Math.abs(target.position.x - floatTarget.x) > 0.05) {
        target.position.x += (floatTarget.x > target.position.x ? speed : -speed);
    }
    else if (Math.abs(target.position.y - floatTarget.y) > 0.05) {
        target.position.y += (floatTarget.y > target.position.y ? speed : -speed);
    }
    else if (Math.abs(target.position.z - floatTarget.z) > 0.05) {
        target.position.z += (floatTarget.z > target.position.z ? speed : -speed);
    }


}