import * as React from "react";
import { useRef, useEffect } from "react";

const FEEDBACK_CONTENT = {
    Ready: {
        title: "System is ready for your input",
        subtitle: null,
        cta: { label: "SEND", action: "send" },
    },
    SystemBusy: {
        title: "System is busy right now",
        subtitle: "Please wait",
        cta: null,
    },
    Feedback: {
        title: "Your input data has been sent",
        // subtitle: "You may now close the tab",
        cta: {label: "again", action: 'again'},
    },
    SystemOverloaded: {
        title: "System is overloaded, your input might destroy it",
        subtitle: null,
        cta: { label: "Send anyway", action: "send" },
    },
    SystemFailure: {
        title: "System failed due to overload",
        subtitle: "Please wait",
        cta: null,
    },
    NoContribution: {
        title: "Your input is necessary, but dangerous for the _system",
        subtitle: "You may now close the tab",
        cta: null,
    },
};

export const FeedbackStep = ({
    isOverloaded = false,
    isBusy = false,
    dataSent = false,
    noContribution = false,
    isFailure = false,
    isRebooting = false,
    onSend = () => { },
    onCubeMounted = () => { },
}) => {
    const cubeRef = useRef(null);

    useEffect(() => {
        const measureCubePosition = () => {
            if (cubeRef.current) {
                const rect = cubeRef.current.getBoundingClientRect();
                const cubeCenter = rect.top + rect.height / 2;
                const viewportHeight = window.innerHeight;
                const placementPercent = (cubeCenter / viewportHeight) * 100;
                onCubeMounted(`${placementPercent.toFixed(1)}%`);
            }
        };

        // Measure on mount
        measureCubePosition();

        // Re-measure on window resize
        window.addEventListener('resize', measureCubePosition);
        return () => window.removeEventListener('resize', measureCubePosition);
    }, [onCubeMounted]);
    let display = "Ready";
    if (noContribution) {
        display = "NoContribution";
    } else if (dataSent) {
        display = "Feedback";
    } else if (isFailure || isRebooting) {
        display = "SystemFailure";
    } else if (isBusy) {
        display = "SystemBusy";
    } else if (isOverloaded) {
        display = "SystemOverloaded";
    }

    const { title, subtitle, cta } = FEEDBACK_CONTENT[display];

    return (
        <div className="feedback-step-wrapper">
            <div className="feedback-step">
                <p className="feedback-title">{title}</p>
            </div>
            <div className="feedback-cube-container">
                <div className="feedback-cube" ref={cubeRef}></div>
                <div>
                    <p className="id-name">digital-data</p>
                </div>
            </div>
            <div className="feedback-footer">
                {subtitle && <p className="feedback-subtitle">{subtitle}</p>}
                {cta && (
                    <button className="glass-btn feedback-cta" onClick={onSend}>
                        {cta.label}
                    </button>
                )}
            </div>
        </div>
    );
};

export default FeedbackStep;