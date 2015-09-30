#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform float u_time;

float plot(vec2 st, float pct){
  return  smoothstep( pct-0.02, pct, st.y) - 
          smoothstep( pct, pct+0.02, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;
    
    vec3 color = vec3(0.0);

    color.r = step(0.25, st.x);
    color.g = step(0.50, st.x);
    color.b = step(0.75, st.x);

    gl_FragColor = vec4(color,1.0);
}