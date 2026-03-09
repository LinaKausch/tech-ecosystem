import * as THREE from 'three';
import { createLine, animateLine } from './line.js';

export const createWalls = (scene) => {
    let lines = [];
    for (let i = 0; i < 50; i++) {
        const line = createLine(scene, { x: -17, y: -4, z: 15 - i }, { x: 17, y: -4, z: 15 - i }, 'y');
        lines.push(line);
    }

    let lines2 = [];
    for (let i = 0; i < 50; i++) {
        const line = createLine(scene, { x: -17, y: 6, z: 15 - i }, { x: 17, y: 6, z: 15 - i }, 'y');
        lines2.push(line);
    }

    let lines3 = [];
    for (let i = 0; i < 50; i++) {
        const wall = createLine(scene, { x: 5, y: -12 + i * 0.5, z: 15 }, { x: 5, y: -12 + i * 0.5, z: -35 }, 'y');
        lines3.push(wall)
    }

    let lines4 = [];
    for (let i = 0; i < 50; i++) {
        const wall2 = createLine(scene, { x: -5, y: -12 + i * 0.5, z: 15 }, { x: -5, y: -12 + i * 0.5, z: -35 }, 'y');
        lines4.push(wall2)
    }
   return { lines, lines2, lines3, lines4 };
    // return {lines};
}

export const updateWalls = (state, time) => {
  const { lines, lines2, lines3, lines4 } = state;
    // const { lines } = state;

    lines.forEach(lineState => {
        animateLine(lineState, time);
    });
    lines2.forEach(lineState => {
        animateLine(lineState, time);
    });
    lines3.forEach(lineState => {
        animateLine(lineState, time);
    });
    lines4.forEach(lineState => {
        animateLine(lineState, time);
    });
}