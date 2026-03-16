#define Use_Simplex

uniform float iTime;
varying vec3 vLocalPos;

#define MOD3 vec3(.1031,.11369,.13787)

vec3 hash33(vec3 p3)
{
    p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(
        (p3.x + p3.y) * p3.z,
        (p3.x + p3.z) * p3.y,
        (p3.y + p3.z) * p3.x));
}

float simplex_noise(vec3 p)
{
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;

    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);

    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);

    vec3 d1 = d0 - (i1 - 1.0 * K2);
    vec3 d2 = d0 - (i2 - 2.0 * K2);
    vec3 d3 = d0 - (1.0 - 3.0 * K2);

    vec4 h = max(0.6 - vec4(
        dot(d0,d0),
        dot(d1,d1),
        dot(d2,d2),
        dot(d3,d3)), 0.0);

    vec4 n = h*h*h*h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i+i1)),
        dot(d2, hash33(i+i2)),
        dot(d3, hash33(i+1.0)));

    return dot(vec4(31.316), n);
}

float noise(vec3 p)
{
    return simplex_noise(p);
}

float noise_sum_abs(vec3 p)
{
    float f = 0.0;
    p *= 3.0;

    f += 1.0 * abs(noise(p)); p *= 2.0;
    f += 0.5 * abs(noise(p)); p *= 2.0;
    f += 0.25 * abs(noise(p)); p *= 2.0;
    f += 0.125 * abs(noise(p)); p *= 2.0;
    f += 0.0625 * abs(noise(p));

    return f;
}

vec3 draw_fire(float f)
{
    f = f * 0.5 + 0.5;

    return mix(
        vec3(0.0/255.0, 0.0/255.0, 57.0/255.0),
        vec3(55.0/255.0, 91.0/255.0, 177.0/255.0),
        pow(f,3.0));
}

void main()
{
    vec3 pos = vLocalPos * 3.0;

    // upward flame motion
    pos.y -= iTime * 0.01;

    float f = noise_sum_abs(pos);

    vec3 col = draw_fire(f);

    gl_FragColor = vec4(col,1.0);
}
