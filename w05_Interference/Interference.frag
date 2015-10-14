#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

//  Function from Iñigo Quiles 
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0, 
                     0.0, 
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main() {
    float waveLength = 1.0 - abs(sin(u_time / 10.0));

    float colorCircle = 15.0;
    float colorH = mod(u_time, colorCircle) / colorCircle;
    float colorS = abs(sin(mod(u_time, colorCircle * 2.0) / (colorCircle * 2.0) * 2.0 * PI));
    float colorB = abs(sin(mod(u_time, colorCircle * 3.0) / (colorCircle * 3.0) * 2.0 * PI));

    vec3 sourceColor = hsb2rgb(vec3(colorH, colorS, colorB));

    vec2 point1 = vec2(0.0, 0.5);
    vec2 point2 = vec2(1.0, 0.5);

    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    
    st -= vec2(0.5);
    st *= rotate2d(sin(u_time / 20.0) * 2.0 * PI);
    st += vec2(0.5);

    float distance1 = distance(point1, st);
    float distance2 = distance(point2, st);

    float phase1 = sin((distance1 / waveLength) * 2.0 * PI);
    float phase2 = sin((distance2 / waveLength) * 2.0 * PI);

    float phaseDifference = abs(phase1 - phase2);

    vec3 color = sourceColor * phaseDifference;


    

    gl_FragColor = vec4(color,1.0);
}