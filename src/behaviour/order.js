import * as THREE from 'three';

const occupied = new Set();
const objectSize = 0.3;
const snap = (v) => Math.round(v / objectSize) * objectSize;

// Global synchronization state
const syncState = {
    cycle: 0,
    agentsOnCycle: new Map() 
};

const easeInOutBack = (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

const randomTarget = () => new THREE.Vector3(
    snap((Math.random() - 0.5) * 8),
    snap((Math.random() - 0.5) * 8),
    snap((Math.random() - 0.5) * 8)
);

export const orderInit = (object) => {
    const key = `${object.position.x},${object.position.y},${object.position.z}`;
    object.userData.key = key;
    object.userData.agentId = Math.random().toString();
    object.userData.state = "waiting";
    object.userData.stepQueue = [];
    object.userData.currentStep = null;
    object.userData.cycle = 0;
    occupied.add(key);

    syncState.agentsOnCycle.set(object.userData.agentId, 0);

    let target;
    do {
        target = randomTarget();
    } while (occupied.has(`${target.x},${target.y},${target.z}`));
    object.userData.target = target;
};

export const orderCleanup = (object) => {
    if (object.userData?.key) {
        occupied.delete(object.userData.key);
    }
    if (object.userData?.agentId) {
        syncState.agentsOnCycle.delete(object.userData.agentId);
    }
};

const axisQueue = (object) => {
    const axis = ['x', 'y', 'z'];
    axis.sort((a, b) => Math.abs(object.position[a] - object.userData.target[a]) - Math.abs(object.position[b] - object.userData.target[b]));
    object.userData.stepQueue = [];
    axis.forEach((ax, i) => {
        object.userData.stepQueue.push({
            type: 'move',
            axis: ax,
            startPos: object.position[ax],
            endPos: object.userData.target[ax],
            startTime: 0,
            overShootDone: false
        });
        if (i < axis.length - 1) {
            object.userData.stepQueue.push({ type: 'wait', duration: 1500 });
        }
    });
    object.userData.stepQueue.push({ type: 'wait', duration: 1500 });
}

export const order = (object, dt) => {

    const target = object.mesh || object;

    if (!target.userData.target) {
        orderInit(target);
        axisQueue(target);
    }

    // Check if we should advance to next cycle
    const allReady = Array.from(syncState.agentsOnCycle.values()).every(agentCycle => agentCycle >= syncState.cycle);
    if (allReady && syncState.agentsOnCycle.size > 0) {
        syncState.cycle++;
    }

    // Wait for cycle to start moving
    if (target.userData.cycle < syncState.cycle && target.userData.state === "waiting") {
        target.userData.state = "moving";
        target.userData.cycle = syncState.cycle;
        target.userData.currentStep = target.userData.stepQueue.shift();

        if (!target.userData.currentStep) {
            occupied.delete(target.userData.key);

            let newTarget;
            do {
                newTarget = randomTarget();
            } while (occupied.has(`${newTarget.x},${newTarget.y},${newTarget.z}`));

            target.userData.target.copy(newTarget);
            axisQueue(target);
            target.userData.currentStep = target.userData.stepQueue.shift();
        }

        target.userData.currentStep.startTime = dt;
    }

    const step = target.userData.currentStep;
    if (!step) return;

    if (step.type === 'wait') {
        if (dt - step.startTime >= step.duration) {
            target.userData.state = "waiting";
            syncState.agentsOnCycle.set(target.userData.agentId, syncState.cycle);
        }
        return;
    }

    const axis = step.axis;
    const elapsed = dt - step.startTime;
    const moveDuration = 2000;
    const progress = Math.min(elapsed / moveDuration, 1);
    const easedProgress = easeInOutBack(progress);

    const overshoot = 0.05 * Math.sign(step.endPos - step.startPos);
    let currentTarget = step.endPos;
    if (!step.overShootDone && progress > 0.1) {
        currentTarget += overshoot;
        step.overShootDone = true;
    }
    target.position[axis] = THREE.MathUtils.lerp(step.startPos, currentTarget, easedProgress);

    if (progress >= 1) {
        if (step.overShootDone && currentTarget !== step.endPos) {
            step.startPos = target.position[axis];
            step.endPos = step.endPos;
            step.startTime = dt;
            step.overShootDone = false;
        } else {
            target.userData.currentStep = target.userData.stepQueue.shift();

            if (target.userData.currentStep) {
                target.userData.currentStep.startTime = dt;
            } else {
                target.userData.state = "waiting";
                syncState.agentsOnCycle.set(target.userData.agentId, syncState.cycle);
            }
        }
    }
}

export { occupied, objectSize, snap };