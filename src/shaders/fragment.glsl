#ifdef GL_ES
precision mediump float;
#endif

uniform float iTime;
varying vec3 vLocalPos;

// ------------------- Micro-tech lines -------------------
float techLines(vec3 p) {
    float l = 0.0;
    l += smoothstep(0.995, 1.0, abs(sin(p.x*50.0 + iTime*3.0)));
    l += smoothstep(0.995, 1.0, abs(cos(p.y*60.0 - iTime*2.5)));
    l += smoothstep(0.995, 1.0, abs(sin(p.z*70.0 + iTime*4.0)));
    l += smoothstep(0.995, 1.0, abs(sin((p.x+p.y+p.z)*40.0 + iTime*3.5)));
    return l / 4.0;
}

// ------------------- Frosted base -------------------
float frosted(vec3 p) {
    float n = 0.0;
    n += fract(sin(dot(p, vec3(12.989,78.233, 37.719))) * 43758.5453);
    n += fract(sin(dot(p*1.5, vec3(93.989, 67.345, 21.456))) * 24634.6345);
    return n / 2.0;
}

// ------------------- Main -------------------
void main() {
    vec3 pos = vLocalPos * 2.0;

    // subtle flowing movement
    pos += vec3(
        sin(pos.y*10.0 + iTime*0.5)*0.05,
        cos(pos.z*10.0 + iTime*0.3)*0.05,
        sin(pos.x*10.0 + iTime*0.7)*0.05
    );

    float linesVal = techLines(pos);
    float baseFrost = frosted(pos) * 0.15;

    // Base translucent dark
    vec3 col = vec3(0.01, 0.01, 0.05);

    // Neon lines, amplified
    col += vec3(0.0, 0.8, 1.0) * linesVal;

    // Glow around lines
    col += vec3(0.0, 0.4, 0.7) * linesVal * 1.2;

    // Frosted soft glow at edges
    float edgeGlow = 1.0 - length(vLocalPos);
    col += vec3(0.0, 0.15, 0.25) * edgeGlow * 0.5;

    // Alpha: base + amplified lines
    float alpha = 0.2 + linesVal * 0.9 + baseFrost * 0.2;

    gl_FragColor = vec4(col, alpha);
}