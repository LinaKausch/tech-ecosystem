import React, { useRef, useState, useEffect } from 'react';

const wrapValue = (value, max) => {
    if (max <= 0) return 0;
    return ((value % max) + max) % max;
};

const Slider = ({ onChange }) => {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const startOffsetRef = useRef(0);
    const containerWidthRef = useRef(0);
    const patternWidthRef = useRef(0);

    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const updateSizes = () => {
            const container = containerRef.current;
            const track = trackRef.current;
            if (!container || !track) return;

            containerWidthRef.current = container.getBoundingClientRect().width;
            patternWidthRef.current = track.scrollWidth / 2;
        };

        updateSizes();
        window.addEventListener('resize', updateSizes);
        return () => window.removeEventListener('resize', updateSizes);
    }, []);

    const handlePointerDown = (event) => {
        const container = containerRef.current;
        if (!container) return;

        containerWidthRef.current = container.getBoundingClientRect().width;
        isDraggingRef.current = true;
        startXRef.current = event.clientX;
        startOffsetRef.current = offset;

        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
        if (!isDraggingRef.current) return;
        const delta = event.clientX - startXRef.current;
        const max = patternWidthRef.current || containerWidthRef.current;
        const nextOffset = wrapValue(startOffsetRef.current + delta, max);
        setOffset(nextOffset);

        if (onChange && max > 0) {
            onChange(nextOffset / max);
        }
    };

    const handlePointerUp = (event) => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                zIndex: 1000,
                pointerEvents: 'auto',
                width: '100%',
                height: '3rem',
                border: '1px solid rgba(101, 197, 227, 0.8)',
                overflow: 'hidden',
                background: 'rgba(28, 28, 28, 0.1)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
                cursor: isDraggingRef.current ? 'grabbing' : 'grab',
                userSelect: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <div
                style={{
                    position: 'absolute',
                    top: '5%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '8px',
                    height: '30px',
                    background: '#1C1C1C',
                    border: '1px solid #7ECCF8',
                    zIndex: 2,
                    pointerEvents: 'none',
                }}
            />
            <div
                ref={trackRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    display: 'flex',
                    transform: `translateX(${-offset}px)`,
                }}
            >
                <div
                    style={{
                        flex: '0 0 100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, rgba(28, 28, 28, 0.12), rgba(40, 90, 120, 0.25), rgba(28, 28, 28, 0.12))',
                    }}
                />
                <div
                    style={{
                        flex: '0 0 100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, rgba(28, 28, 28, 0.12), rgba(40, 90, 120, 0.25), rgba(28, 28, 28, 0.12))',
                    }}
                />
            </div>
        </div>
    );
};

export default Slider;