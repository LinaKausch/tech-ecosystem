import React, { useEffect, useRef, useState } from 'react';

const HealthDiagram = ({ agentsRef }) => {
    const canvasRef = useRef(null);
    const [healthHistory, setHealthHistory] = useState([]);
    const maxHistoryPoints = 100;

    // Update health data on interval
    useEffect(() => {
        const interval = setInterval(() => {
            if (!agentsRef?.current || agentsRef.current.length === 0) return;

            const aliveAgents = agentsRef.current.filter(agent => !agent.isDead);
            if (aliveAgents.length === 0) return;

            const totalHealthScore = aliveAgents.reduce((sum, agent) => sum + (agent.dna?.healthScore || 0), 0);
            const avgHealth = totalHealthScore / aliveAgents.length;

            setHealthHistory(prev => {
                const newHistory = [...prev, avgHealth];
                return newHistory.length > maxHistoryPoints ? newHistory.slice(-maxHistoryPoints) : newHistory;
            });
        }, 100); // Update every 100ms

        return () => clearInterval(interval);
    }, [agentsRef]);

    // Draw on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || healthHistory.length === 0) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 30;

        // Clear canvas
        ctx.fillStyle = 'rgba(28, 28, 28, 0.9)';
        ctx.fillRect(0, 0, width, height);

        // Draw border
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const y = padding + (i / 10) * (height - padding * 2);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw axis labels
        ctx.fillStyle = '#999';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('100', padding - 10, padding + 5);
        ctx.fillText('0', padding - 10, height - padding + 5);

        // Draw health line graph
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();

        healthHistory.forEach((health, index) => {
            const x = padding + (index / (healthHistory.length - 1 || 1)) * (width - padding * 2);
            const y = height - padding - (health / 100) * (height - padding * 2);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw current value circle
        if (healthHistory.length > 0) {
            const currentHealth = healthHistory[healthHistory.length - 1];
            const x = width - padding;
            const y = height - padding - (currentHealth / 100) * (height - padding * 2);

            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Draw value text
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(currentHealth.toFixed(1), width - padding - 15, padding + 20);
        }

        // Draw title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Average Health Score', width / 2, 20);
    }, [healthHistory]);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                background: 'rgba(20, 20, 20, 0.95)',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #666',
                zIndex: 100,
            }}
        >
            <canvas
                ref={canvasRef}
                width={300}
                height={200}
                style={{
                    display: 'block',
                    borderRadius: '4px',
                }}
            />
        </div>
    );
};

export default HealthDiagram;
