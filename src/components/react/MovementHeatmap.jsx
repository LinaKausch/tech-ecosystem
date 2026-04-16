// import React, { useEffect, useRef, useState } from 'react';

// const MovementHeatmap = ({ agentsRef }) => {
//     const canvasRef = useRef(null);
//     const heatmapRef = useRef(null);
//     const gridSize = 10; // 10x10 grid
//     const gridRange = 4; // Scene range from -4 to 4
//     const decayRate = 0.95; // Heat fades over time

//     // Initialize heatmap grid
//     useEffect(() => {
//         heatmapRef.current = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
//     }, []);

//     // Update heatmap when agents move
//     useEffect(() => {
//         const interval = setInterval(() => {
//             if (!agentsRef?.current || !heatmapRef.current) return;

//             // Decay existing heat
//             for (let i = 0; i < gridSize; i++) {
//                 for (let j = 0; j < gridSize; j++) {
//                     heatmapRef.current[i][j] *= decayRate;
//                 }
//             }

//             // Add agent positions to heatmap
//             agentsRef.current.forEach(agent => {
//                 if (!agent.isDead && agent.mesh) {
//                     const pos = agent.mesh.position;

//                     // Convert world position to grid coordinates
//                     const gridX = Math.floor(((pos.x + gridRange) / (gridRange * 2)) * gridSize);
//                     const gridY = Math.floor(((pos.z + gridRange) / (gridRange * 2)) * gridSize);

//                     // Clamp to grid bounds
//                     const x = Math.max(0, Math.min(gridSize - 1, gridX));
//                     const y = Math.max(0, Math.min(gridSize - 1, gridY));

//                     heatmapRef.current[x][y] = Math.min(100, heatmapRef.current[x][y] + 5);
//                 }
//             });
//         }, 50);

//         return () => clearInterval(interval);
//     }, [agentsRef]);

//     // Draw heatmap continuously
//     useEffect(() => {
//         const canvas = canvasRef.current;
//         if (!canvas || !heatmapRef.current) return;

//         const drawFrame = () => {
//             const ctx = canvas.getContext('2d');
//             const cellSize = canvas.width / gridSize;

//             // Clear canvas
//             ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
//             ctx.fillRect(0, 0, canvas.width, canvas.height);

//             // Draw grid cells with heat colors
//             for (let i = 0; i < gridSize; i++) {
//                 for (let j = 0; j < gridSize; j++) {
//                     const heat = heatmapRef.current[i][j];
//                     const normalized = Math.min(heat / 100, 1);

//                     // Heat color gradient: black → blue → white (neutral, mostly dark)
//                     let color;
//                     if (normalized < 0.5) {
//                         // Black to blue (longer range = more black)
//                         const t = normalized / 0.5;
//                         const r = Math.floor(126 * t);
//                         const g = Math.floor(204 * t);
//                         const b = Math.floor(248 * t);
//                         color = `rgb(${r}, ${g}, ${b})`;
//                     } else if (normalized < 0.8) {
//                         // Blue to light gray/white
//                         const t = (normalized - 0.5) / 0.3;
//                         const r = Math.floor(126 + (230 - 126) * t);
//                         const g = Math.floor(204 + (230 - 204) * t);
//                         const b = Math.floor(248 + (248 - 248) * t);
//                         color = `rgb(${r}, ${g}, ${b})`;
//                     } else {
//                         // Light gray to white
//                         const t = (normalized - 0.8) / 0.2;
//                         const r = Math.floor(230 + (255 - 230) * t);
//                         const g = Math.floor(230 + (255 - 230) * t);
//                         const b = Math.floor(248 + (255 - 248) * t);
//                         color = `rgb(${r}, ${g}, ${b})`;
//                     }

//                     ctx.fillStyle = color;
//                     ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);

//                     // Draw grid lines
//                     ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
//                     ctx.lineWidth = 0.5;
//                     ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
//                 }
//             }

//             // Draw title
//             // ctx.fillStyle = '#fff';
//             // ctx.font = 'bold 12px Arial';
//             // ctx.textAlign = 'center';
//             // ctx.fillText('Movement Heatmap (Top-Down)', canvas.width / 2, canvas.height - 5);

//             requestAnimationFrame(drawFrame);
//         };

//         drawFrame();
//     }, [gridSize]);

//     return (
//         <div
//             style={{
//                 position: 'fixed',
//                 top: 20,
//                 left: 20,
//                 background: 'rgba(0, 0, 0, 0.95)',
//                 padding: '10px',
//                 border: '1px solid #444444',
//                 zIndex: 100,
//             }}
//         >
//             <canvas
//                 ref={canvasRef}
//                 width={200}
//                 height={200}
//                 style={{ display: 'block' }}
//             />
//         </div>
//     );
// };

// export default MovementHeatmap;


import React, { useEffect, useRef } from 'react';

const MovementHeatmap = ({ agentsRef }) => {
    const canvasRef = useRef(null);
    const heatmapRef = useRef(null);

    const gridSize = 10;
    const gridRange = 4;
    const decayRate = 0.9;

    useEffect(() => {
        heatmapRef.current = Array(gridSize)
            .fill(null)
            .map(() => Array(gridSize).fill(0));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!agentsRef?.current || !heatmapRef.current) return;

            // decay
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    heatmapRef.current[i][j] *= decayRate;
                }
            }

            // add heat
            agentsRef.current.forEach(agent => {
                if (!agent.isDead && agent.mesh) {
                    const pos = agent.mesh.position;

                    const gridX = Math.floor(((pos.x + gridRange) / (gridRange * 2)) * gridSize);
                    const gridY = Math.floor(((pos.z + gridRange) / (gridRange * 2)) * gridSize);

                    const x = Math.max(0, Math.min(gridSize - 1, gridX));
                    const y = Math.max(0, Math.min(gridSize - 1, gridY));

                    heatmapRef.current[x][y] = Math.min(
                        100,
                        heatmapRef.current[x][y] + 6
                    );
                }
            });
        }, 50);

        return () => clearInterval(interval);
    }, [agentsRef]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !heatmapRef.current) return;

        const ctx = canvas.getContext('2d');

        const draw = () => {
            const cellSize = canvas.width / gridSize;

            // softer fade = more motion trails
            ctx.fillStyle = 'rgba(0, 0, 0, 0.98)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const heat = heatmapRef.current[i][j];
                    const t = Math.min(heat / 100, 1);

                    if (t <= 0.08) continue;

                    const x = i * cellSize + cellSize / 2;
                    const y = j * cellSize + cellSize / 2;

                    // size grows with heat
                    // const radius = (cellSize * 0.15) + (cellSize * 0.75 * t);
                    const radius = (cellSize * 0.05) + (cellSize * 0.55 * t);

                    // Keep heat color on the same blue used in the display text.
                    const r = 126 * t;
                    const g = 204 * t;
                    const b = 248 * t;
                    // const g = 204;
                    // const b = 248;

                    // glow blob
                    const gradient = ctx.createRadialGradient(
                        x,
                        y,
                        0,
                        x,
                        y,
                        radius
                    );

                    // const alpha = 0.15 + 0.6 * t;

                    // gradient.addColorStop(
                    //     0,
                    //     `rgba(${r}, ${g}, ${b}, ${alpha})`
                    // );
                    // gradient.addColorStop(
                    //     1,
                    //     `rgba(${r}, ${g}, ${b}, 0)`
                    // );
                    const alpha = 0.05 + 0.3 * t;

                    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
                    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            requestAnimationFrame(draw);
        };

        draw();
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                top: 20,
                left: 20,
                background: 'rgba(0,0,0,0.85)',
                padding: 10,
                border: '1px solid #444',
                zIndex: 100,
            }}
        >
            <canvas
                ref={canvasRef}
                width={220}
                height={220}
                style={{ display: 'block' }}
            />
        </div>
    );
};

export default MovementHeatmap;