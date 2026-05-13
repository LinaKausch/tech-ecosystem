const nouns = [
    'kernel',
    'node',
    'matrix',
    'vector',
    'tensor',
    'channel',
    'protocol',
    'module',
    'port',
    'phase'
]

const adjectives = [
    'neural',
    'synth',
    'quantum',
    'encoded',
    'digital',
    'haptic',
    'meta',
    'parallel',
    'fractal',
    'compiled'
]

export const getRandomIdName = () => {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective}-${noun}`;
};