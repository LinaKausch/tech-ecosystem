import * as THREE from 'three';
import { createAgent } from './agent.js';

const mutateColor = (color, mutationRate = 0.3) => {
    const newColor = color.clone();
    if (Math.random() > mutationRate) return newColor;

    const hsl = {};
    newColor.getHSL(hsl);
    hsl.h += (Math.random() * 2 - 1) * 0.1;
    hsl.s += (Math.random() * 2 - 1) * 0.05;
    hsl.l += (Math.random() * 2 - 1) * 0.05;

    hsl.h = (hsl.h + 1) % 1;
    hsl.s = THREE.MathUtils.clamp(hsl.s, 0, 1);
    hsl.l = THREE.MathUtils.clamp(hsl.l, 0, 1);

    newColor.setHSL(hsl.h, hsl.s, hsl.l);
    return newColor;
}

export const mixDNA = (dna1, dna2) => {
    const mutationRate = 0.5;

    const mutate = (value, range = 0.1) => {
        if (Math.random() > mutationRate) return value;
        const delta = (Math.random() * 2 - 0.5) * range;
        return value + delta;
    };

    const baseColor = dna1.color.clone().lerp(dna2.color, Math.random());
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
        speed: mutate(Math.random() - 0.5 ? dna1.speed : dna2.speed),
        opacity: Math.max(0.2, THREE.MathUtils.lerp(dna1.opacity, dna2.opacity, Math.random())),
        metalness: mutate(THREE.MathUtils.lerp(dna1.metalness, dna2.metalness, Math.random())),
        healthScore: newHealth,
        mass: mutate(THREE.MathUtils.lerp(dna1.mass, dna2.mass, Math.random())),
    }
}

export const populationControl = (scene, agents) => {
    const aliveAgents = agents.filter(agent => !agent.isDead);
    if (aliveAgents.length < 50 && aliveAgents.length > 2) {
        for (let i = 0; i < 60; i++) {
            const survivor1 = aliveAgents[Math.floor(Math.random() * aliveAgents.length)];
            const survivor2 = aliveAgents[Math.floor(Math.random() * aliveAgents.length)];
            if (survivor1 != survivor2) {
                const newDNA = mixDNA(survivor1.dna, survivor2.dna);
                const spawnPos = new THREE.Vector3(0, 0, 0);
                createAgent(scene, newDNA, spawnPos).then(newAgent => {
                    agents.push(newAgent);
                });
            }
        }
    }
    return agents.filter(agent => !agent.isDead);
}

export const inputLife = (scene, agents, inputDNA) => {
    const aliveAgents = agents.filter(agent => !agent.isDead);
    if (inputDNA && aliveAgents.length > 0) {
        const mostSimilarSurvivor = findMostSimilarSurvivor(aliveAgents, inputDNA);
        for (let i = 0; i < 30; i++) {
            const newDNA = mixDNA(mostSimilarSurvivor.dna, inputDNA);
            const spawnPos = new THREE.Vector3(0, 0, 0);
            createAgent(scene, newDNA, spawnPos).then(newAgent => {
                agents.push(newAgent);
            });
        }
    }
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


