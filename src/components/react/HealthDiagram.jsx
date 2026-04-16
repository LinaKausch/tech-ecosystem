import React, { useEffect, useRef, useState } from 'react';

const HealthDiagram = ({ agentsRef }) => {
    const canvasRef = useRef(null);
    const [aliveHistory, setAliveHistory] = useState([]);
    const maxHistoryPoints = 200;

    // Update alive-agent data on interval
    useEffect(() => {
        const interval = setInterval(() => {
            if (!agentsRef?.current || agentsRef.current.length === 0) return;

            const aliveAgents = agentsRef.current.filter(agent => !agent.isDead);
            setAliveHistory(prev => {
                const newHistory = [...prev, aliveAgents.length];
                return newHistory.length > maxHistoryPoints ? newHistory.slice(-maxHistoryPoints) : newHistory;
            });
        }, 100); // Update every 100ms

        return () => clearInterval(interval);
    }, [agentsRef]);

    // Draw on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || aliveHistory.length === 0) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 10;
        const maxAlive = Math.max(10, ...aliveHistory);

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);

        // Draw border
        // ctx.strokeStyle = '#666';
        // ctx.lineWidth = 2;
        // ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);

        // Draw grid lines
        // ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        // ctx.lineWidth = 1;
        // for (let i = 0; i <= 10; i++) {
        //     const y = padding + (i / 10) * (height - padding * 2);
        //     ctx.beginPath();
        //     ctx.moveTo(padding, y);
        //     ctx.lineTo(width - padding, y);
        //     ctx.stroke();
        // }

        // Draw axis labels
        // ctx.fillStyle = '#999';
        // ctx.font = '12px Arial';
        // ctx.textAlign = 'right';
        // ctx.fillText(String(maxAlive), padding - 10, padding + 5);
        // ctx.fillText('0', padding - 10, height - padding + 5);

        // Draw alive-agents line graph
        ctx.strokeStyle = '#7ECCF8';
        ctx.lineWidth = 2;
        ctx.beginPath();

        aliveHistory.forEach((aliveCount, index) => {
            const x = padding + (index / (aliveHistory.length - 1 || 1)) * (width - padding * 2);
            const y = height - padding - (aliveCount / maxAlive) * (height - padding * 2);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw current value circle
        if (aliveHistory.length > 0) {
            const currentAlive = aliveHistory[aliveHistory.length - 1];
            const x = width - padding;
            const y = height - padding - (currentAlive / maxAlive) * (height - padding * 2);

            ctx.fillStyle = '#7ECCF8';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Draw value text
            // ctx.fillStyle = '#7ECCF8';
            // ctx.font = 'bold 14px Arial';
            // ctx.textAlign = 'right';
            // ctx.fillText(String(currentAlive), width - padding - 15, padding + 20);
        }

        // Draw title
        // ctx.fillStyle = '#fff';
        // ctx.font = 'bold 16px Arial';
        // ctx.textAlign = 'center';
        // ctx.fillText('Alive Agents', width / 2, 20);
    }, [aliveHistory]);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 20,
                left: 20,
                background: 'rgba(0, 0, 0, 0.95)',
                padding: '10px',
                border: '1px solid #444444',
                zIndex: 100,
            }}
        >
            <canvas
                ref={canvasRef}
                width={800}
                height={100}
                style={{ display: 'block' }}
            />
        </div>
    );
};

export default HealthDiagram;
