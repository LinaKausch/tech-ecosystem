import * as React from "react";
import { useState, useEffect } from "react";

export const FeedbackStep = () => {
    return (
        <div style={{ zIndex: 1, display: 'flex', height: '100dvh', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
            {/* <Feedback /> */}
            {/* <SystemBusy /> */}
            {/* <Ready /> */}
            {/* <SystemOverloaded />  */}
            <NoContribution />
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