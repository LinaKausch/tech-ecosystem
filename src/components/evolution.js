import * as THREE from 'three';
import { createAgent } from './agent.js';

export const mixDNA = (dna1, dna2) => {
    const mutationRate = 0.1;

    const mutate = (value, range = 0.1) => {
        return Math.random() < mutationRate ? value + (Math.random() - 0.5) * range : value;
    };
    return {
        widthExt: Math.random() > 0.5 ? dna1.widthExt : dna2.widthExt,
        heightExt: Math.random() > 0.5 ? dna1.heightExt : dna2.heightExt,
        depthExt: THREE.MathUtils.lerp(dna1.depthExt, dna2.depthExt, Math.random()),
        color: dna1.color.clone().lerp(dna2.color, Math.random()),
        speed: mutate(Math.random() - 0.5 ? dna1.speed : dna2.speed),
        opacity: Math.max(0.2, THREE.MathUtils.lerp(dna1.opacity, dna2.opacity, Math.random())),
        metalness: mutate(THREE.MathUtils.lerp(dna1.metalness, dna2.metalness, Math.random())),
        healthScore: mutate(THREE.MathUtils.lerp(dna1.healthScore, dna2.healthScore, Math.random())),
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
                const newAgent = createAgent(scene, newDNA, spawnPos);
                agents.push(newAgent);
            }
        }
    }
    return agents.filter(agent => !agent.isDead);
}

//if population < 50 then take 2 random survivors and reproduce until population 100

