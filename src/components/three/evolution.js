import * as THREE from 'three';
import { createAgent } from './agent.js';

const SPAWN_DELAY_MS = 35;
export const INPUT_SPAWN_DELAY_MS = 120;
export const INPUT_SPAWN_COUNT = 40;

const spawnAgentWithDelay = (
    scene,
    agents,
    dna,
    index,
    delayMs = SPAWN_DELAY_MS,
    startDelayMs = 0
) => {
    const spawnPos = new THREE.Vector3(0, 0, 0);
    setTimeout(() => {
        createAgent(scene, dna, spawnPos).then(newAgent => {
            agents.push(newAgent);
        });
    }, startDelayMs + index * delayMs);
};

const mutateColor = (color, mutationRate = 0.3) => {
    const newColor = color.clone();
    if (Math.random() > mutationRate) return newColor;

    const hsl = {};
    newColor.getHSL(hsl);
    hsl.h += (Math.random() * 2 - 1) * 0.1;
    hsl.s += (Math.random() * 2 - 1) * 0.05;
    hsl.l += (Math.random() * 2 - 1) * 0.05;

    hsl.h = (hsl.h + 1) % 1;
    hsl.s = THREE.MathUtils.clamp(hsl.s, 0.35, 1);
    hsl.l = THREE.MathUtils.clamp(hsl.l, 0, 1);

    newColor.setHSL(hsl.h, hsl.s, hsl.l);
    return newColor;
}

const mixColors = (color1, color2) => {
    const hsl1 = {};
    const hsl2 = {};

    color1.getHSL(hsl1);
    color2.getHSL(hsl2);

    let hueDelta = hsl2.h - hsl1.h;
    if (hueDelta > 0.5) hueDelta -= 1;
    if (hueDelta < -0.5) hueDelta += 1;

    const mixFactor = Math.random();
    const mixedHue = (hsl1.h + hueDelta * mixFactor + 1) % 1;
    const mixedSaturation = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(hsl1.s, hsl2.s, mixFactor),
        0.35,
        1
    );
    const mixedLightness = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(hsl1.l, hsl2.l, mixFactor),
        0.2,
        0.8
    );

    return new THREE.Color().setHSL(mixedHue, mixedSaturation, mixedLightness);
};

export const mixDNA = (dna1, dna2) => {
    const mutationRate = 0.5;

    const mutate = (value, range = 0.1) => {
        if (Math.random() > mutationRate) return value;
        const delta = (Math.random() * 2 - 0.5) * range;
        return value + delta;
    };

    const baseColor = mixColors(dna1.color, dna2.color);
    const newHealth = THREE.MathUtils.clamp(
        mutate(THREE.MathUtils.lerp(dna1.healthScore - 20, dna2.healthScore + 20, Math.random())),
        0,
        100
    );

    return {
        widthExt: Math.random() > 0.5 ? dna1.widthExt : dna2.widthExt,
        heightExt: Math.random() > 0.5 ? dna1.heightExt : dna2.heightExt,
        depthExt: THREE.MathUtils.lerp(dna1.depthExt, dna2.depthExt, Math.random()),
        color: mutateColor(baseColor),
        speed: mutate(Math.random() > 0.5 ? dna1.speed : dna2.speed),
        opacity: Math.max(0.2, THREE.MathUtils.lerp(dna1.opacity, dna2.opacity, Math.random())),
        metalness: mutate(THREE.MathUtils.lerp(dna1.metalness, dna2.metalness, Math.random())),
        healthScore: newHealth,
        mass: mutate(THREE.MathUtils.lerp(dna1.mass, dna2.mass, Math.random())),
    }
}

export const populationControl = (scene, agents) => {
    const aliveAgents = agents.filter(agent => !agent.isDead);
    if (aliveAgents.length < 100 && aliveAgents.length > 2) {
        for (let i = 0; i < 100; i++) {
            const survivor1 = aliveAgents[Math.floor(Math.random() * aliveAgents.length)];
            const survivor2 = aliveAgents[Math.floor(Math.random() * aliveAgents.length)];
            if (survivor1 != survivor2) {
                const newDNA = mixDNA(survivor1.dna, survivor2.dna);
                spawnAgentWithDelay(scene, agents, newDNA, i);
            }
        }
        return 1; 
    }
    return 0; 
}

export const inputLife = (scene, agents, inputDNA, startDelayMs = 0) => {
    const aliveAgents = agents.filter(agent => !agent.isDead);
    if (inputDNA && aliveAgents.length > 0) {
        const mostSimilarSurvivor = findMostSimilarSurvivor(aliveAgents, inputDNA);
        for (let i = 0; i < INPUT_SPAWN_COUNT; i++) {
            const newDNA = mixDNA(mostSimilarSurvivor.dna, inputDNA);
            spawnAgentWithDelay(scene, agents, newDNA, i, INPUT_SPAWN_DELAY_MS, startDelayMs);
        }
        return 1;
    }
    return 0; 
}

const calculateDNASimilarity = (dna1, dna2) => {
    const colorDiff = Math.sqrt(
        Math.pow(dna1.color.r - dna2.color.r, 2) +
        Math.pow(dna1.color.g - dna2.color.g, 2) +
        Math.pow(dna1.color.b - dna2.color.b, 2)
    );

    const distance =
        Math.abs(dna1.widthExt - dna2.widthExt) +
        Math.abs(dna1.heightExt - dna2.heightExt) +
        Math.abs(dna1.depthExt - dna2.depthExt) +
        colorDiff +
        Math.abs(dna1.speed - dna2.speed) +
        Math.abs(dna1.opacity - dna2.opacity) +
        Math.abs(dna1.metalness - dna2.metalness) +
        Math.abs(dna1.healthScore - dna2.healthScore) * 0.01 +
        Math.abs(dna1.mass - dna2.mass) * 0.1;

    return distance;
};

const findMostSimilarSurvivor = (aliveAgents, inputDNA) => {
    if (aliveAgents.length === 0) return null;

    let mostSimilar = aliveAgents[0];
    let minDistance = calculateDNASimilarity(aliveAgents[0].dna, inputDNA);

    for (let i = 1; i < aliveAgents.length; i++) {
        const distance = calculateDNASimilarity(aliveAgents[i].dna, inputDNA);
        if (distance < minDistance) {
            minDistance = distance;
            mostSimilar = aliveAgents[i];
        }
    }
    return mostSimilar;
};


