import * as THREE from 'three';

const occupied = new Set();
const objectSize = 0.3;
const snap = (v) => Math.round(v / objectSize) * objectSize;

const easeInOutBack = (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

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
    const speed = 0.002;
      const moveDuration = 6000;

    if (target.userData.state === "idle") {
        if (dt < target.userData.waitUntil) {
            return;
        }

        occupied.delete(target.userData.key);
        target.userData.state = "moving";
        target.userData.startPos = target.position.clone();
        target.userData.startTime = dt;
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

    // Apply easing to movement - one axis at a time
    const elapsed = dt - target.userData.startTime;
    const progress = Math.min(elapsed / moveDuration, 1);
    const easedProgress = easeInOutBack(progress);
    const easeSpeed = 0.002 * (1 + easedProgress * 2); // Speed increases with easing

    if (Math.abs(target.position.x - floatTarget.x) > 0.05) {
        // target.position.x += (floatTarget.x > target.position.x ? speed : -speed);
        target.position.x += (floatTarget.x > target.position.x ? easeSpeed : -easeSpeed);
    }
    else if (Math.abs(target.position.y - floatTarget.y) > 0.05) {
        // target.position.y += (floatTarget.y > target.position.y ? speed : -speed);
        target.position.y += (floatTarget.y > target.position.y ? easeSpeed : -easeSpeed);
    }
    else if (Math.abs(target.position.z - floatTarget.z) > 0.05) {
        // target.position.z += (floatTarget.z > target.position.z ? speed : -speed);
        target.position.z += (floatTarget.z > target.position.z ? easeSpeed : -easeSpeed);

    }


}