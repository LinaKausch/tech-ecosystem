#ifdef GL_ES
precision mediump float;
#endif

uniform float iTime;
uniform vec3 dnaColor;
varying vec3 vLocalPos;

// ------------------- Structured tech lines -------------------
float techLines(vec3 p) {
    float l = 0.0;

    // grid-like structure
    l += smoothstep(0.992, 1.0, abs(sin(p.x*40.0 + iTime*1.2)));
    l += smoothstep(0.992, 1.0, abs(sin(p.y*40.0 - iTime*1.0)));

    // diagonal micro connections
    l += smoothstep(0.995, 1.0, abs(sin((p.x+p.z)*30.0 + iTime*1.5)));

    return l / 3.0;
}

// ------------------- Flowing data pulses -------------------
float dataFlow(vec3 p) {
    float flow = sin(p.y * 6.0 + iTime * 2.0);
    flow += sin((p.x + p.z) * 4.0 - iTime * 1.5);
    return smoothstep(0.2, 1.0, flow);
}

// ------------------- Frosted/matte base -------------------
float frosted(vec3 p) {
    float n = 0.0;
    n += fract(sin(dot(p, vec3(12.989,78.233, 37.719))) * 43758.5453);
    n += fract(sin(dot(p*1.7, vec3(93.989, 67.345, 21.456))) * 24634.6345);
    return n * 0.5;
}

// ------------------- Main -------------------
void main() {
    vec3 pos = vLocalPos * 2.0;

    // subtle motion (kept calm for many objects)
    pos += vec3(
        sin(pos.y*6.0 + iTime*0.2)*0.01,
        cos(pos.z*6.0 + iTime*0.15)*0.01,
        sin(pos.x*6.0 + iTime*0.25)*0.01
    );

    float linesVal = techLines(pos);
    float flowVal  = dataFlow(pos);
    float frostVal = frosted(pos);

    // ------------------- Base (frosted glass) -------------------
    vec3 col = vec3(0.01, 0.02, 0.05);

    // ------------------- Data lines -------------------
    float signal = linesVal * (0.5 + flowVal * 0.8);

    // core bright lines - increased intensity
    col += dnaColor * signal * 1.2;

    // soft glow halo - boosted
    col += dnaColor * signal * 0.8;
    
    // extra emissive boost
    col += dnaColor * signal * 0.6;

    // ------------------- Frost / matte diffusion -------------------
    col += vec3(0.02, 0.03, 0.06) * frostVal * 0.3;

    // ------------------- Edge soft glow -------------------
    float edge = 1.0 - length(vLocalPos);
    col += dnaColor * edge * 0.4;

    // ------------------- Alpha -------------------
    float alpha = 0.75 + frostVal * 0.3 + signal * 0.5;

    gl_FragColor = vec4(col, alpha);
}