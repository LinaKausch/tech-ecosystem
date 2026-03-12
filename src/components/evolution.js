// import * as THREE from 'three';
import { createAgent } from './agent.js';
import { follow } from '../behaviour/follow.js';

export const mixDNA = (dna1, dna2) => {
    return {
        size: 0.12,
        color: Math.random() < 0.5 ? dna1.color : dna2.color,
        segmentsW: Math.random() < 0.5 ? dna1.segmentsW : dna2.segmentsW,
        segmentsH: Math.random() < 0.5 ? dna1.segmentsH : dna2.segmentsH,
    }
}

// export const mutateDNA - do i want this?

export const createOffspring = (scene, parent1, parent2, count = 3) => {
    const offsprings = [];

    for (let i = 0; i < count; i++) {
        const offspringDNA = mixDNA(parent1.dna, parent2.dna);
        const targetParent = Math.random() < 0.5 ? parent1 : parent2;
        const offspring = createAgent(scene, offspringDNA, null, follow, parent1.generation + 1);
        offspring.target = targetParent;
        offsprings.push(offspring);

    }
    return offsprings;

}

