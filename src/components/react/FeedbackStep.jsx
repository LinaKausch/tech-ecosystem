import * as React from "react";
import { useState, useEffect } from "react";

export const FeedbackStep = ({ isOverloaded = false, isBusy = false, dataSent = false, noContribution = false, isFailure = false, isRebooting = false, onSend = () => { } }) => {
    let display = 'Ready';
    if (noContribution) {
        display = 'NoContribution';
    } else if (dataSent) {
        display = 'Feedback';
    } else if (isFailure || isRebooting) {
        display = 'SystemFailure';
    } else if (isBusy) {
        display = 'SystemBusy';
    } else if (isOverloaded) {
        display = 'SystemOverloaded';
    }

    return (
        <div style={{ zIndex: 1, display: 'flex', height: '100dvh', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            {display === 'Ready' && <Ready onSend={onSend} />}
            {display === 'SystemBusy' && <SystemBusy />}
            {display === 'Feedback' && <Feedback />}
            {display === 'SystemOverloaded' && <SystemOverloaded onSend={onSend} />}
            {display === 'SystemFailure' && <SystemFailure />}
            {display === 'NoContribution' && <NoContribution />}
        </div>
    );
}

export const Feedback = () => {
    return (
        <div className="feedback-step" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '2.5rem', textAlign: 'center' }}>Your input data has been sent</p>
            <p style={{ color: "#7ECCF8" }}>You may now close the tab</p>
        </div>
    )
}

export const SystemBusy = () => {
    return (
        <div className="feedback-step" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '2.5rem', textAlign: 'center' }}>System is busy right now</p>
            <p style={{ color: "#7ECCF8" }}>Please wait...</p>
        </div>
    )
}

export const Ready = ({ onSend = () => { } }) => {
    return (
        <div className="feedback-step" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '2.5rem', textAlign: 'center' }}>System is ready for your input</p>
            <button className="glass-btn" style={{ marginTop: '1rem' }} onClick={onSend}>SEND</button>
        </div>
    )
}

export const SystemOverloaded = ({ onSend = () => { } }) => {
    return (
        <div className="feedback-step" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '2.5rem', textAlign: 'center' }}>System is overloaded, your input might destroy it</p>
            <button className="glass-btn" style={{ marginTop: '1rem' }} onClick={onSend}>Send anyway</button>
        </div>
    )
}

export const SystemFailure = () => {
    return (
        <div className="feedback-step" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '2.5rem', textAlign: 'center' }}>System failed due to overload</p>
            <p style={{ color: "#7ECCF8" }}>Please wait while it reboots...</p>
        </div>
    )
}

export const NoContribution = () => {
    return (
        <div className="feedback-step" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '2.5rem', textAlign: 'center' }}>Your input is necessary, but dangerous for
                the _system</p>
            <p style={{ color: "#7ECCF8" }}>You may now close the tab</p>
        </div>
    )
}

export default FeedbackStep;