#ifdef GL_ES
precision mediump float;
#endif

uniform float iTime;
uniform vec3 dnaColor;
varying vec3 vLocalPos;

// ------------------- Micro-tech lines (very subtle) -------------------
float techLines(vec3 p) {
    float l = 0.0;
    // only one line direction
    l += smoothstep(0.995, 1.0, abs(sin(p.x*50.0 + iTime*1.5)));
    return l; // no division, just a single subtle line
}

// ------------------- Frosted/matte base -------------------
float frosted(vec3 p) {
    float n = 0.0;
    n += fract(sin(dot(p, vec3(12.989,78.233, 37.719))) * 43758.5453);
    n += fract(sin(dot(p*1.5, vec3(93.989, 67.345, 21.456))) * 24634.6345);
    return n / 2.0;
}

// ------------------- Main -------------------
void main() {
    vec3 pos = vLocalPos * 2.0;

    // very subtle flow
    pos += vec3(
        sin(pos.y*10.0 + iTime*0.2)*0.01,
        cos(pos.z*10.0 + iTime*0.15)*0.01,
        sin(pos.x*10.0 + iTime*0.25)*0.01
    );

    float linesVal = techLines(pos) * 0.5; // dimmed
    float baseFrost = frosted(pos) * 0.1;  // still matte, subtle

    // Matte dark base
    vec3 col = vec3(0.01, 0.02, 0.05); 

    // Very subtle neon lines
    col += dnaColor * linesVal * 0.3;

    // Minimal glow around lines
    col += dnaColor * linesVal * 0.2;

    // Edge frost/matte glow
    float edgeGlow = 1.0 - length(vLocalPos);
    col += vec3(0.0, 0.05, 0.1) * edgeGlow * 0.3;

    // Moderately opaque for blending many objects
    float alpha = 0.5 + baseFrost * 0.3 + linesVal * 0.2;

    gl_FragColor = vec4(col, alpha);
}