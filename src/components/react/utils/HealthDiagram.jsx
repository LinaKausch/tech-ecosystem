import React, { useEffect, useRef, useState } from 'react';

const HealthDiagram = ({ agentsRef }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [aliveHistory, setAliveHistory] = useState([]);
    const [numHistory, setNumHistory] = useState([]);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 100 });
    const maxHistoryPoints = 100;

    // Generate fake num data that follows the alive agent count
    useEffect(() => {
        const interval = setInterval(() => {
            if (!agentsRef?.current || agentsRef.current.length === 0) return;

            const aliveAgents = agentsRef.current.filter(agent => !agent.isDead);
            const newAliveCount = aliveAgents.length;

            setAliveHistory(prev => {
                const newHistory = [...prev, newAliveCount];
                return newHistory.length > maxHistoryPoints ? newHistory.slice(-maxHistoryPoints) : newHistory;
            });

            // Generate fake crypto-like num data with random volatility
            setNumHistory(prev => {
                const lastNum = prev.length > 0 ? prev[prev.length - 1] : 1000 + (newAliveCount * 2);
                const baseNum = 1000 + (newAliveCount * 2);
                const trendFollowing = (baseNum - lastNum) * 0.15;
                const randomWalk = (Math.random() - 0.5) * 60;
                const occasionalSpike = Math.random() > 0.85 ? (Math.random() - 0.5) * 200 : 0;
                const newNum = lastNum + trendFollowing + randomWalk + occasionalSpike;

                const newHistory = [...prev, newNum];
                return newHistory.length > maxHistoryPoints ? newHistory.slice(-maxHistoryPoints) : newHistory;
            });
        }, 100); // Update every 100ms for smoother animation

        return () => clearInterval(interval);
    }, [agentsRef]);

    // Handle canvas resize based on container width
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                setCanvasDimensions({ width: width || 800, height: 70 });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || numHistory.length === 0) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 10;
        const maxNum = Math.max(10, ...numHistory);
        const minNum = Math.min(...numHistory);
        const numRange = maxNum - minNum || 1;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = '#7ECCF8';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        numHistory.forEach((num, index) => {
            const x = padding + (index / (numHistory.length - 1 || 1)) * (width - padding * 2);
            const y = height - padding - ((num - minNum) / numRange) * (height - padding * 2);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else if (index === 1) {
                ctx.lineTo(x, y);
            } else {
                const prevNum = numHistory[index - 1];
                const prevX = padding + ((index - 1) / (numHistory.length - 1 || 1)) * (width - padding * 2);
                const prevY = height - padding - ((prevNum - minNum) / numRange) * (height - padding * 2);
                const cpX = (prevX + x) / 2;
                const cpY = (prevY + y) / 2;
                ctx.quadraticCurveTo(cpX, cpY, x, y);
            }
        });
        ctx.stroke();

        // Draw current value circle
        if (numHistory.length > 0) {
            const currentNum = numHistory[numHistory.length - 1];
            const x = width - padding;
            const y = height - padding - ((currentNum - minNum) / numRange) * (height - padding * 2);

        }
    }, [numHistory]);

    return (
        <div className='health-diagram' ref={containerRef} style={{ width: 'calc(100vw - 280px)' }}>
            <canvas
                ref={canvasRef}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                style={{ display: 'block', filter: 'blur(4px)', width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default HealthDiagram; 