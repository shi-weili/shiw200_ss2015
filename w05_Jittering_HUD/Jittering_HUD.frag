#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}

float box(in vec2 _st, in vec2 _size){
    _size = vec2(0.5) - _size*0.5;
    vec2 uv = smoothstep(_size,
                        _size+vec2(0.001),
                        _st);
    uv *= smoothstep(_size,
                    _size+vec2(0.001),
                    vec2(1.0)-_st);
    return uv.x*uv.y;
}

float grid(in vec2 _st, in int steps) {
    float stepLength = 1.0 / float(steps);

    float r = 0.0;
    float c = 0.0;

    for(int i = 0; i < steps; i++) {
      r += box(_st + vec2(0.0, -0.5 + 0.1 * float(i)), vec2(2.0, 0.005));
    }

    for(int i = 0; i < steps; i++) {
      r += box(_st + vec2(-0.5 + 0.1 * float(i), 0.0), vec2(0.005, 2.0));
    }

    return r + c;
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    float m1 = max(sin(st.x * 20.0 * u_time), 0.0);
    float m2 = max(sin(st.x * 5.0 * u_time), 0.0);
    float m3 = max(sin(u_time * 1.0), 0.0);
    float scale = 0.05;

    // Red:
    vec2 m = vec2(0.0);
    m += vec2(m1 * m2 * m3 * scale * 1.0);
    st += m;
    color += vec3(grid(st, 10), 0.0, 0.0);
    st -= m;

    // Green:
    m = vec2(0.0);
    m += vec2(m1 * m2 * m3 * scale * 0.5);
    st += m;
    color += vec3(0.0, grid(st, 10), 0.0);
    st -= m;

    // Blue:
    m = vec2(0.0);
    m += vec2(m1 * m2 * m3 * scale * 0.2);
    st += m;
    color += vec3(0.0, 0.0, grid(st, 10));
    st -= m;


    gl_FragColor = vec4(color,1.0);
}