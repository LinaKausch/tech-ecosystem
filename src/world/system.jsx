import * as THREE from 'three';
import { formatDurationMs } from '../components/react/utils/timer.jsx';

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
export const OVERLOAD_AGENT_THRESHOLD = 300;
export const OVERLOAD_PHONE_THRESHOLD = 5;
export const FAILURE_AGENT_THRESHOLD = 400;
export const COLLAPSE_ANIMATION_DURATION = 4000;
export const REBOOT_DURATION = 3000; // 3 seconds to reboot
export const RECOVERY_ZOOM_DURATION = 2000; // 2 seconds to zoom camera back in
export const SAVE_STORAGE_KEY = 'systemstats';

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
        total: 0,
        fromPopulationControl: 0,
        fromUserInput: 0
    },

    // Persisted dead count from before refresh (for current system try)
    deadAgentsOffset: 0,

    // System tries
    systemTries: 1,

    // Current system try timing
    currentTryStartTime: Date.now(),

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

const COLOR_GROUPS = [
    { name: 'red', start: 340, end: 20 },
    { name: 'orange', start: 20, end: 40 },
    { name: 'yellow', start: 40, end: 60 },
    { name: 'lime', start: 60, end: 90 },
    { name: 'green', start: 90, end: 150 },
    { name: 'teal', start: 150, end: 170 },
    { name: 'cyan', start: 170, end: 200 },
    { name: 'sky blue', start: 200, end: 220 },
    { name: 'blue', start: 220, end: 260 },
    { name: 'purple', start: 260, end: 290 },
    { name: 'magenta', start: 290, end: 320 },
    { name: 'pink', start: 320, end: 340 }
];

const getColorGroupByHue = (hueDeg) => {
    for (const group of COLOR_GROUPS) {
        if (hueDeg >= group.start && hueDeg < group.end) {
            return group.name;
        }
    }
    return 'red';
};

const getColorHexAndGroup = (threeColor) => {
    const hsl = {};
    threeColor.getHSL(hsl);
    const hueDeg = (hsl.h * 360 + 360) % 360;
    const hex = `#${threeColor.getHexString().toUpperCase()}`;
    return {
        hex,
        group: getColorGroupByHue(hueDeg),
        h: hsl.h,
        s: hsl.s,
        l: hsl.l
    };
};

const circularHueDiff = (h1, h2) => {
    const raw = Math.abs(h1 - h2);
    return Math.min(raw, 1 - raw);
};

const hslDistance = (a, b) => {
    const hueDiff = circularHueDiff(a.h, b.h);
    const satDiff = Math.abs(a.s - b.s);
    const lightDiff = Math.abs(a.l - b.l);

    // Higher lightness weight avoids one bright outlier representing a dark-majority group.
    const weightedHue = hueDiff * 0.6;
    const weightedSat = satDiff * 1.0;
    const weightedLight = lightDiff * 1.4;

    return Math.sqrt(
        weightedHue * weightedHue +
        weightedSat * weightedSat +
        weightedLight * weightedLight
    );
};

const updateClusterCenter = (cluster) => {
    const totalWeight = cluster.members.reduce((sum, member) => sum + member.count, 0);
    if (totalWeight <= 0) return;

    let sumS = 0;
    let sumL = 0;
    let sumHueX = 0;
    let sumHueY = 0;

    cluster.members.forEach((member) => {
        const weight = member.count;
        const angle = member.h * Math.PI * 2;
        sumHueX += Math.cos(angle) * weight;
        sumHueY += Math.sin(angle) * weight;
        sumS += member.s * weight;
        sumL += member.l * weight;
    });

    const centerAngle = Math.atan2(sumHueY, sumHueX);
    const normalizedHue = ((centerAngle / (Math.PI * 2)) + 1) % 1;

    cluster.center = {
        h: normalizedHue,
        s: sumS / totalWeight,
        l: sumL / totalWeight
    };
    cluster.totalCount = totalWeight;
};

const getClusterRepresentatives = (groupData, groupName) => {
    const entries = Array.from(groupData.colors.entries()).map(([hex, entry]) => ({
        hex,
        count: entry.count,
        h: entry.h,
        s: entry.s,
        l: entry.l
    }));

    const clusters = [];
    const similarityThreshold = 0.18;

    entries.forEach((entry) => {
        let bestCluster = null;
        let bestDistance = Infinity;

        clusters.forEach((cluster) => {
            const distance = hslDistance(entry, cluster.center);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestCluster = cluster;
            }
        });

        if (!bestCluster || bestDistance > similarityThreshold) {
            const newCluster = {
                members: [entry],
                center: { h: entry.h, s: entry.s, l: entry.l },
                totalCount: entry.count
            };
            clusters.push(newCluster);
            return;
        }

        bestCluster.members.push(entry);
        updateClusterCenter(bestCluster);
    });

    clusters.forEach(updateClusterCenter);

    const rankedClusters = clusters.sort((a, b) => b.totalCount - a.totalCount);

    return rankedClusters.map((cluster) => {
        const representative = cluster.members
            .sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count;
                return hslDistance(a, cluster.center) - hslDistance(b, cluster.center);
            })[0];

        return {
            hex: representative.hex,
            count: cluster.totalCount,
            group: groupName
        };
    });
};

let lastDominantGroupsLogSignature = '';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
export const getDominantColors = (agents, count = 3) => {
    const groups = new Map();

    agents.forEach((agent) => {
        if (agent.isDead || !agent.dna?.color) return;

        const { hex, group, h, s, l } = getColorHexAndGroup(agent.dna.color);

        if (!groups.has(group)) {
            groups.set(group, {
                total: 0,
                colors: new Map()
            });
        }

        const groupData = groups.get(group);
        groupData.total += 1;
        if (!groupData.colors.has(hex)) {
            groupData.colors.set(hex, {
                count: 0,
                h,
                s,
                l
            });
        }
        groupData.colors.get(hex).count += 1;
    });

    const rankedGroups = Array.from(groups.entries())
        .sort((a, b) => b[1].total - a[1].total);

    const selected = [];
    const selectedHexes = new Set();

    // First pass: at most one color per hue group.
    for (const [groupName, groupData] of rankedGroups) {
        if (selected.length >= count) break;

        const representatives = getClusterRepresentatives(groupData, groupName);
        const topHexEntry = representatives[0];

        if (!topHexEntry) continue;

        const { hex, count: hexCount } = topHexEntry;
        if (selectedHexes.has(hex)) continue;

        selected.push({ hex, count: hexCount, group: groupName });
        selectedHexes.add(hex);
    }

    // Fallback: if not enough groups/colors, take additional colors from strongest group(s).
    if (selected.length < count) {
        for (const [groupName, groupData] of rankedGroups) {
            if (selected.length >= count) break;

            const rankedHexes = getClusterRepresentatives(groupData, groupName);

            for (const { hex, count: hexCount } of rankedHexes) {
                if (selected.length >= count) break;
                if (selectedHexes.has(hex)) continue;

                selected.push({ hex, count: hexCount, group: groupName });
                selectedHexes.add(hex);
            }
        }
    }

    const dominantGroupsLog = selected.map((item) => `${item.group}:${item.hex}(${item.count})`);
    const signature = dominantGroupsLog.join('|');
    if (signature && signature !== lastDominantGroupsLogSignature) {
        lastDominantGroupsLogSignature = signature;
        console.log('Dominant color groups:', dominantGroupsLog);
    }

    return selected;
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
        systemState.currentTryStartTime = Date.now();

        // Reset per-system stats
        systemState.generationTracker.total = 0;
        systemState.generationTracker.fromPopulationControl = 0;
        systemState.generationTracker.fromUserInput = 0;
        systemState.deadAgentsOffset = 0;

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

const saveData = {
    system: {
        alive: 0,
        dead: 0,
        timer: 0,
        popControlGen: 0,
        userInputGen: 0,
        dominantColors: []
    },
    global: {
        totalInputs: 0,
        systemTries: 0
    }
}

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
        systemState.generatingUntil = Math.max(systemState.generatingUntil, Date.now() + 2500);
        systemState.isUserInputGeneration = false;
    }
};

export const getTotalGenerations = () => (
    systemState.generationTracker.fromPopulationControl +
    systemState.generationTracker.fromUserInput
);

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

export const buildSaveData = (aliveAgents, deadAgents, dominantColors) => {
    const timerMs = Date.now() - systemState.currentTryStartTime;
    const timerSeconds = Math.floor(timerMs / 1000);
    return {
        system: {
            alive: aliveAgents,
            dead: deadAgents,
            timerSeconds,
            timerLabel: formatDurationMs(timerMs),
            popControlGen: systemState.generationTracker.fromPopulationControl,
            userInputGen: systemState.generationTracker.fromUserInput,
            dominantColors
        },
        global: {
            totalInputs: systemState.totalUserInputs,
            systemTries: systemState.systemTries
        }
    }
};

export const loadPersistedStats = () => {
    if (typeof localStorage === 'undefined') return null;

    try {
        const raw = localStorage.getItem(SAVE_STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        const savedSystem = parsed?.system ?? {};
        const savedGlobal = parsed?.global ?? {};

        if (Number.isFinite(savedGlobal.systemTries)) {
            systemState.systemTries = savedGlobal.systemTries;
        }

        if (Number.isFinite(savedGlobal.totalInputs)) {
            systemState.totalUserInputs = savedGlobal.totalInputs;
        }

        if (Number.isFinite(savedSystem.popControlGen)) {
            systemState.generationTracker.fromPopulationControl = savedSystem.popControlGen;
        }

        if (Number.isFinite(savedSystem.userInputGen)) {
            systemState.generationTracker.fromUserInput = savedSystem.userInputGen;
        }

        if (Number.isFinite(savedSystem.dead)) {
            systemState.deadAgentsOffset = savedSystem.dead;
        }

        const persistedTimerMs = Number.isFinite(savedSystem.timerSeconds)
            ? savedSystem.timerSeconds * 1000
            : Number.isFinite(savedSystem.timerMs)
                ? savedSystem.timerMs
                : Number.isFinite(savedSystem.timer)
                    ? savedSystem.timer
                    : null;

        if (Number.isFinite(persistedTimerMs)) {
            systemState.currentTryStartTime = Date.now() - persistedTimerMs;
        }

        return parsed;
    } catch (error) {
        console.error('Failed to load persisted stats:', error);
        return null;
    }
};

export const savePersistedStats = (aliveAgents, deadAgents, dominantColors) => {
    if (typeof localStorage === 'undefined') return;

    try {
        localStorage.setItem(
            SAVE_STORAGE_KEY,
            JSON.stringify(buildSaveData(aliveAgents, deadAgents, dominantColors))
        );
    } catch (error) {
        console.error('Failed to save persisted stats:', error);
    }
};
