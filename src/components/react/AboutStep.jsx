import * as React from "react";

const AboutStep = ({ onClose }) => {
    return (
        <div className="about-step">
            <button
                onClick={onClose}
                className="about-step-close-btn"
            >
                X
            </button>
            <div className="about-step-content">
                <h2>The_Intake</h2>

                <p>
                    This project was created by <strong>Lina Kausch</strong>, mentored by <strong>Larix Kortbeek</strong>, during an internship period at <strong>PlusOne<sup style={{ fontSize: '0.7em', verticalAlign: 'super' }}>®</sup></strong>. It explores a <em>real-time interactive system</em> in which visual elements behave as <em>data carriers</em> inside a continuous digital environment.
                </p>

                <p>
                    The idea was born from the <em>overwhelming</em> feeling caused by growing technology. We rely on it every day for information, communication, and almost in every step of our lives. Social media and evolving AI agents make things faster and more accessible, but they also demand <em>constant attention</em>. There is always more to consume, more to process, more to interact with. Over time, this <em>constant intake</em> of quick dopamine sources and easy results becomes overwhelming and can damage our attention.
                </p>

                <p>
                    This project became a system that absorbs every input it receives. Each interaction <em>leaves a trace</em>. Some fade, while others become part of the system and <em>shape its appearance</em>.
                </p>

                <p>
                    The system is designed to remain stable, but it has <em>its limits</em>. As more input is introduced, it becomes <em>increasingly fragile</em>. It can heal itself, but if pushed too far, it <em>fails, collapses, and restarts</em>.
                </p>

                <p>
                    This reflects a tension I notice in everyday life. <em>Input is sometimes necessary for a change</em>, but it also has consequences. The system mirrors us, as humans become overwhelmed when there is <em>no pause, no filter, and no limit</em>.
                </p>

                <p style={{ marginBottom: '2rem' }}>
                    You can interpret this work in your own way. It is not a <em>fixed statement</em>, but an invitation to observe how <em>continuous input</em> shapes both systems and ourselves.
                </p>

                <h3>Process</h3>

                <p>
                    This project was developed through experimentation with <strong>Three.js</strong> and <strong>React</strong>. There was no clear vision of the outcome in the beginning. Many iterations were created, tested, and discarded along the way.
                </p>

                <p>
                    The process focused on building a system that evolves over time and responds to live input. Rather than following a strict plan, decisions were made through exploration, balancing technical possibilities with visual and interactive behavior.
                </p>

                <p style={{ marginBottom: '2rem' }}>
                    The result is both a technical experiment and a way to express an idea through interaction, leaving space for interpretation.
                </p>
                <p style={{textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Lina Kausch x PlusOne<sup style={{ fontSize: '0.7em', verticalAlign: 'super' }}>®</sup>
                </p>
            </div>
        </div>
    )
}

export default AboutStep;