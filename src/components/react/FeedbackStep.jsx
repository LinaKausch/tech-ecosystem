import * as React from "react";
import { useState, useEffect } from "react";

export const FeedbackStep = ({ isOverloaded = false, isBusy = false, dataSent = false, noContribution = false, isFailure = false, isRebooting = false }) => {
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
            {display === 'Ready' && <Ready />}
            {display === 'SystemBusy' && <SystemBusy />}
            {display === 'Feedback' && <Feedback />}
            {display === 'SystemOverloaded' && <SystemOverloaded />}
            {display === 'SystemFailure' && <SystemFailure />}
            {display === 'NoContribution' && <NoContribution />}
        </div>
    );
}

export const Feedback = () => {
    return (
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '2.5rem', textAlign: 'center' }}>Your input data has been sent</p>
            <p>You may now close the tab</p>
        </div>
    )
}

export const SystemBusy = () => {
    return (
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '2.5rem', textAlign: 'center' }}>System is busy right now</p>
            <p>Please wait...</p>
        </div>
    )
}

export const Ready = () => {
    return (
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '2.5rem', textAlign: 'center' }}>System is ready for your input</p>
            <button style={{ marginTop: '1rem' }}>SEND</button>
        </div>
    )
}

export const SystemOverloaded = () => {
    return (
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '2.5rem', textAlign: 'center' }}>System is overloaded, your input might destroy it</p>
            <button style={{ marginTop: '1rem' }}>Send anyway</button>
        </div>
    )
}

export const SystemFailure = () => {
    return (
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '2.5rem', textAlign: 'center' }}>System failed due to overload</p>
            <p>Please wait while it reboots...</p>
        </div>
    )
}

export const NoContribution = () => {
    return (
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            <p style={{ fontFamily: 'Share Tech Mono', fontSize: '2.5rem', textAlign: 'center' }}>Your input is necessary, but dangerous for
                the _system</p>
            <p>You may now close the tab</p>
        </div>
    )
}

export default FeedbackStep;