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
            ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
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
        <div className='movement-heatmap'>
            <canvas
                ref={canvasRef}
                width={220}
                height={220}
                style={{ display: 'block', filter: 'blur(4px)' }}
            />
        </div>
    );
};

export default MovementHeatmap;