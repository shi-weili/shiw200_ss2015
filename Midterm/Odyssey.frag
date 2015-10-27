// Odyssey - A Film Made of Fragment Shaders
// Author: Weili Shi
// E-mail: me@shi-weili.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float circle(in vec2 _st, in float _radius){
    vec2 l = _st-vec2(0.5);
    return 1.-smoothstep(_radius-(_radius*0.01),
                         _radius+(_radius*0.01),
                         dot(l,l)*4.0);
}

void main(){

    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    // Aspect Ratio:
    st.x *= u_resolution.x/u_resolution.y;

    // Shift:
    st.x -= 0.5 * u_resolution.x/u_resolution.y;
    st.y -= 0.5;

    // Scale:
    st *= 100.0 * sin(u_time);

    // Shift:
    st.x += 0.5;
    st.y += 0.5;

        // Fract:
    st = fract(st);
    
    vec3 color = vec3(circle(st,0.5));

    gl_FragColor = vec4( color, 1.0 );
}