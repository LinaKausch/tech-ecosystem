import * as THREE from 'three';

// ============================================================================
// CAMERA STATES
// ============================================================================
export const camera_States = {
    IDLE: 'IDLE',
    GENERATING: 'GENERATING',
    OVERLOAD: 'OVERLOAD',
    FAILURE: 'FAILURE',
    REBOOT: 'REBOOT',
    RECOVERING: 'RECOVERING'
};

// ============================================================================
// SYSTEM MESSAGES
// ============================================================================
export const messages = [
    'Normal operation...', // 0: default
    'Identifying user...', // 1: phone connection detected
    'Processing request...', // 2: when receives data from phone
    'Analysing data...', // 3: after processing
    'Generating output...', // 4: when agents spawning
    '! System overload...!', // 5: 300+ agents or 3+ phones
    '! System failure...!', // 6: 300+ agents (critical)
    'Rebooting...', // 7: system rebooting
];

// ============================================================================
// CONSTANTS
// ============================================================================
export const PROCESSING_DURATION_MS = 2000;
export const ANALYSING_DURATION_MS = 2000;
export const OVERLOAD_AGENT_THRESHOLD = 200;
export const OVERLOAD_PHONE_THRESHOLD = 3;
export const FAILURE_AGENT_THRESHOLD = 300;
export const COLLAPSE_ANIMATION_DURATION = 4000;
export const REBOOT_DURATION = 3000; // 3 seconds to reboot
export const RECOVERY_ZOOM_DURATION = 2000; // 2 seconds to zoom camera back in

// ============================================================================
// GLOBAL STATE
// ============================================================================
export let systemState = {
    // Camera & timing
    currentCameraState: camera_States.IDLE,

    // User input timing
    processingUntil: 0,
    analysingUntil: 0,
    generatingSpawnUntil: 0,
    generatingUntil: 0,
    identificationUntil: 0,

    // User input tracking
    isUserInputGeneration: false,

    // Phone connection
    connectedPhones: 0,
    lastConnectedPhones: 0,

    // System collapse
    systemCollapsed: false,
    collapseStartTime: 0,
    rebootStartTime: 0, // When reboot state started
    recoveryStartTime: 0, // When zoom-in back to system starts
    dominantColorsAtCollapse: [], // Dominant colors captured when system fails

    // Generation tracking
    generationTracker: {
        total: 1,
        fromPopulationControl: 1,
        fromUserInput: 0
    },

    // System tries
    systemTries: 1,
    
        // Universal counters
        totalUserInputs: 0,
};

// ============================================================================
// MODULE REFS
// ============================================================================
let moduleSceneRef = null;
let moduleAgentsRef = null;

export const setModuleRefs = (sceneRef, agentsRef) => {
    moduleSceneRef = sceneRef;
    moduleAgentsRef = agentsRef;
};

export const getModuleRefs = () => ({
    moduleSceneRef,
    moduleAgentsRef
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
export const getDominantColors = (agents, count = 3) => {
    const colorMap = new Map();

    agents.forEach(agent => {
        if (!agent.isDead && agent.dna?.color) {
            const hex = '#' + agent.dna.color.getHexString().toUpperCase();
            colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }
    });

    return Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([hex, count]) => ({ hex, count }));
};

// ============================================================================
// SYSTEM COLLAPSE
// ============================================================================
export const resetSystemAfterCollapse = (scene, agentsRef) => {
    // System is now dead - do nothing
    systemState.systemCollapsed = false;
};

// ============================================================================
// CHECK IF REBOOT COMPLETE AND AUTO-RESTART
// ============================================================================
export const checkAndRestartAfterReboot = () => {
    if (!systemState.systemCollapsed || systemState.currentCameraState !== camera_States.REBOOT) {
        return false; // Not in reboot state
    }

    const rebootElapsed = Date.now() - systemState.rebootStartTime;
    if (rebootElapsed >= REBOOT_DURATION) {
        // Reboot complete - start zoom-in for new system try
        systemState.currentCameraState = camera_States.RECOVERING;
        systemState.recoveryStartTime = Date.now();
        systemState.systemTries += 1;

        // Reset per-system stats
        systemState.generationTracker.total = 1;
        systemState.generationTracker.fromPopulationControl = 1;
        systemState.generationTracker.fromUserInput = 0;

        // Reset timing states
        systemState.processingUntil = 0;
        systemState.analysingUntil = 0;
        systemState.generatingUntil = 0;
        systemState.generatingSpawnUntil = 0;
        systemState.isUserInputGeneration = false;

        return true; // Signal to spawn new agents
    }

    return false;
};

export const finishRecovery = () => {
    if (systemState.currentCameraState === camera_States.RECOVERING) {
        systemState.currentCameraState = camera_States.IDLE;
        systemState.systemCollapsed = false;
    }
};

// ============================================================================
// HANDLE REMOTE DATA
// ============================================================================
export const initializeRemoteDataHandler = (inputLife) => {
    return (data, startDelayMs = 0) => {
        if (!data || !moduleAgentsRef?.current || !moduleSceneRef?.current) return;

        const inputDNA = {
            widthExt: data.widthExt || Math.random() * 0.5,
            heightExt: data.heightExt || Math.random() * 0.5,
            depthExt: data.depthExt || Math.random() * 0.5,
            color: data.hex ? new THREE.Color(data.hex) : new THREE.Color('#c2260a'),
            speed: data.speed || Math.random() * 0.02,
            opacity: data.opacity || Math.max(0.2, Math.random()),
            metalness: data.metalness || Math.random(),
            healthScore: data.healthScore || Math.random() * 100,
            mass: data.mass || Math.random() * 10,
        };
        const generatedCount = inputLife(moduleSceneRef.current, moduleAgentsRef.current, inputDNA, startDelayMs);
        if (generatedCount > 0) {
            systemState.generationTracker.fromUserInput += generatedCount;
            systemState.generationTracker.total += generatedCount;
        }
    };
};

// ============================================================================
// UPDATE SYSTEM STATE
// ============================================================================
export const updateSystemState = (agentsRef, aliveAgents, dominantColors = []) => {
    const now = Date.now();

    // Check for system collapse
    if (aliveAgents >= FAILURE_AGENT_THRESHOLD && !systemState.systemCollapsed) {
        systemState.systemCollapsed = true;
        systemState.collapseStartTime = now;
        systemState.currentCameraState = camera_States.FAILURE;
        systemState.dominantColorsAtCollapse = dominantColors; // Capture colors for respawn
    }

    // Determine camera state
    if (systemState.currentCameraState === camera_States.RECOVERING) {
        // Keep recovering camera motion until camera component finishes and calls finishRecovery.
    } else if (systemState.systemCollapsed) {
        // Transition to REBOOT after collapse animation completes
        const collapseElapsed = now - systemState.collapseStartTime;
        if (collapseElapsed >= COLLAPSE_ANIMATION_DURATION) {
            if (systemState.currentCameraState !== camera_States.REBOOT) {
                systemState.currentCameraState = camera_States.REBOOT;
                systemState.rebootStartTime = now; // Mark when reboot started
            }
        } else {
            systemState.currentCameraState = camera_States.FAILURE;
        }
    } else if (aliveAgents >= OVERLOAD_AGENT_THRESHOLD) {
        systemState.currentCameraState = camera_States.OVERLOAD;
    } else if (systemState.isUserInputGeneration) {
        if (now >= systemState.generatingSpawnUntil && now < systemState.generatingUntil) {
            systemState.currentCameraState = camera_States.GENERATING;
        } else if (now >= systemState.generatingUntil) {
            systemState.isUserInputGeneration = false;
        }
    } else {
        if (now < systemState.generatingUntil) {
            systemState.currentCameraState = camera_States.GENERATING;
        } else {
            systemState.currentCameraState = camera_States.IDLE;
        }
    }

    // Return active message
    const isOverloaded = aliveAgents >= OVERLOAD_AGENT_THRESHOLD || systemState.connectedPhones >= OVERLOAD_PHONE_THRESHOLD;
    const activeMessage = systemState.currentCameraState === camera_States.REBOOT || systemState.currentCameraState === camera_States.RECOVERING
        ? messages[7]
        : systemState.systemCollapsed
            ? messages[6]
            : isOverloaded
                ? messages[5]
                : now < systemState.processingUntil
                    ? messages[2]
                    : now < systemState.analysingUntil
                        ? messages[3]
                        : now < systemState.generatingUntil
                            ? messages[4]
                            : now < systemState.identificationUntil
                                ? messages[1]
                                : messages[0];

    return activeMessage;
};

// ============================================================================
// HANDLE POPULATION CONTROL
// ============================================================================
export const handlePopulationControl = (generatedCount) => {
    if (generatedCount > 0) {
        systemState.generationTracker.fromPopulationControl += generatedCount;
        systemState.generationTracker.total += generatedCount;
        systemState.generatingUntil = Math.max(systemState.generatingUntil, Date.now() + 2500);
        systemState.isUserInputGeneration = false;
    }
};

// ============================================================================
// HANDLE PHONE CONNECTION
// ============================================================================
export const handleRemoteCount = (count) => {
    const safeCount = Number.isFinite(count) ? count : 0;
    if (safeCount > systemState.lastConnectedPhones) {
        systemState.identificationUntil = Date.now() + 3000;
    }
    systemState.connectedPhones = safeCount;
    systemState.lastConnectedPhones = safeCount;
};

// ============================================================================
// HANDLE USER INPUT
// ============================================================================
export const handleUserInput = (data, inputSpawnDelayMs = 120, inputSpawnCount = 40) => {
    const now = Date.now();
    const generatingStartDelay = PROCESSING_DURATION_MS + ANALYSING_DURATION_MS;
    
    // Universal counter: count every received user input event.
    systemState.totalUserInputs += 1;
    const spawnBurstDuration = (inputSpawnCount - 1) * inputSpawnDelayMs + 1000;

    systemState.processingUntil = now + PROCESSING_DURATION_MS;
    systemState.analysingUntil = now + generatingStartDelay;
    systemState.generatingSpawnUntil = now + generatingStartDelay;
    systemState.generatingUntil = now + generatingStartDelay + spawnBurstDuration;
    systemState.isUserInputGeneration = true;

    return { data, generatingStartDelay };
};
