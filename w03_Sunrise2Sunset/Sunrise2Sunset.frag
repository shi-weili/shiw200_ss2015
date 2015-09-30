#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 colorA = vec3(0.02,0.13,0.64); // Dark Blue
vec3 colorB = vec3(1.00,0.15,0.14); // Red
vec3 colorC = vec3(0.91,0.34,0.21); // Orange
vec3 colorD = vec3(0.93,0.59,0.07); // Yellow
vec3 colorE = vec3(0.99,0.91,0.71); // Light Yellow
vec3 colorF = vec3(0.71,0.85,1.00); // Cyan

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    float height = st.y;
    float time = mod(u_time, 10.0);
    float pct = 0.0;

    if(time <= 2.0) {
        pct = smoothstep(0.0, time / 2.0, height);
        color = mix(colorC, colorA, pct);
    } else if(time <= 4.0) {
        pct = smoothstep(0.0, (time - 2.0) / 2.0, height);
        color = mix(colorE, colorC, pct);
    } else if(time <= 6.0) {
        color = mix(colorE, colorF, (time - 4.0) / 2.0);
    } else if(time <= 8.0) {
        color = mix(colorF, colorA, (time - 6.0) / 2.0);
    } else if(time <= 10.0) {
        pct = smoothstep(0.0, (time - 8.0) / 2.0, height);
        vec3 tempColor = mix(colorB, colorA, pct);
        color = mix(colorE, tempColor, (time - 4.0) / 2.0);
    }

    // if(0.<= st.y && st.y <= 0.15) {
    //     pct = smoothstep(0., 0.15, st.y);
    //     color = mix(colorD, colorA, pct);
    //     color -= 0.1;
    // } else if(st.y <= 0.3) {
    //     pct = smoothstep(0.15, 0.3, st.y);
    //     color = mix(colorA, colorC, pct);
    //     color -= 0.1;
    // } else if(st.y <= 0.4) {
    //     pct = smoothstep(0.3, 0.4, st.y);
    //     color = mix(colorC, colorA, pct);
    // } else if(st.y <= 0.75) {
    //     pct = smoothstep(0.4, 0.75, st.y);
    //     color = mix(colorA, colorB, pct);
    // } else {
    //     pct = smoothstep(0.75, 1.0, st.y);
    //     color = mix(colorB, colorC, pct);
    // }

    gl_FragColor = vec4(color,1.0);
}