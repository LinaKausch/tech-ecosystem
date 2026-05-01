import React, { useEffect, useRef, useState } from 'react';

const HealthDiagram = ({ agentsRef }) => {
    const canvasRef = useRef(null);
    const [aliveHistory, setAliveHistory] = useState([]);
    const [priceHistory, setPriceHistory] = useState([]);
    const maxHistoryPoints = 100;

    // Generate fake price data that follows the alive agent count
    useEffect(() => {
        const interval = setInterval(() => {
            if (!agentsRef?.current || agentsRef.current.length === 0) return;

            const aliveAgents = agentsRef.current.filter(agent => !agent.isDead);
            const newAliveCount = aliveAgents.length;

            setAliveHistory(prev => {
                const newHistory = [...prev, newAliveCount];
                return newHistory.length > maxHistoryPoints ? newHistory.slice(-maxHistoryPoints) : newHistory;
            });

            // Generate fake crypto-like price data with random volatility
            setPriceHistory(prev => {
                const lastPrice = prev.length > 0 ? prev[prev.length - 1] : 1000 + (newAliveCount * 2);
                const basePrice = 1000 + (newAliveCount * 2);
                const trendFollowing = (basePrice - lastPrice) * 0.15;
                const randomWalk = (Math.random() - 0.5) * 60;
                const occasionalSpike = Math.random() > 0.85 ? (Math.random() - 0.5) * 200 : 0;
                const newPrice = lastPrice + trendFollowing + randomWalk + occasionalSpike;

                const newHistory = [...prev, newPrice];
                return newHistory.length > maxHistoryPoints ? newHistory.slice(-maxHistoryPoints) : newHistory;
            });
        }, 100); // Update every 100ms for smoother animation

        return () => clearInterval(interval);
    }, [agentsRef]);

    // Draw on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || priceHistory.length === 0) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 10;
        const maxPrice = Math.max(10, ...priceHistory);
        const minPrice = Math.min(...priceHistory);
        const priceRange = maxPrice - minPrice || 1;

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);

        // Draw price line graph with smooth curves
        ctx.strokeStyle = '#7ECCF8';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        priceHistory.forEach((price, index) => {
            const x = padding + (index / (priceHistory.length - 1 || 1)) * (width - padding * 2);
            const y = height - padding - ((price - minPrice) / priceRange) * (height - padding * 2);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else if (index === 1) {
                ctx.lineTo(x, y);
            } else {
                const prevPrice = priceHistory[index - 1];
                const prevX = padding + ((index - 1) / (priceHistory.length - 1 || 1)) * (width - padding * 2);
                const prevY = height - padding - ((prevPrice - minPrice) / priceRange) * (height - padding * 2);
                const cpX = (prevX + x) / 2;
                const cpY = (prevY + y) / 2;
                ctx.quadraticCurveTo(cpX, cpY, x, y);
            }
        });
        ctx.stroke();

        // Draw current value circle
        if (priceHistory.length > 0) {
            const currentPrice = priceHistory[priceHistory.length - 1];
            const x = width - padding;
            const y = height - padding - ((currentPrice - minPrice) / priceRange) * (height - padding * 2);

            // ctx.fillStyle = '#7ECCF8';
            // ctx.beginPath();
            // ctx.arc(x, y, 6, 0, Math.PI * 2);
            // ctx.fill();
        }
    }, [priceHistory]);

    return (
        <div className='health-diagram'>
            <canvas
                ref={canvasRef}
                width={800}
                height={100}
                style={{ display: 'block', filter: 'blur(4px)' }}
            />
        </div>
    );
};

export default HealthDiagram; 