#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

/// End of the Noise Function

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

float cross(in vec2 _st, float _size){
    return  box(_st, vec2(_size,_size/4.)) + 
            box(_st, vec2(_size/4.,_size));
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    float noiseScale = 0.00005;
    float noiseSpeed = 1000.0;
        
    // Red:
    vec2 stTemp = st;
    stTemp -= vec2(0.5);
    stTemp *= scale( vec2(0.5) + snoise(vec2(u_time * noiseSpeed + 0.0, u_time * noiseSpeed  + 1000.0)) * noiseScale);
    stTemp *= rotate2d( (sin(u_time * 2.0) + snoise(vec2(u_time * noiseSpeed  + 2000.0, u_time * noiseSpeed  + 3000.0) * noiseScale)) * PI );
    stTemp += vec2(0.5);
    stTemp += vec2(snoise(vec2(u_time * noiseSpeed  + 4000.0, u_time * noiseSpeed  + 5000.0)) * noiseScale, snoise(vec2(u_time * noiseSpeed  + 6000.0, u_time * noiseSpeed  + 7000.0)) * noiseScale);
    color += vec3(cross(stTemp, 0.2), 0, 0);

    // Green:
    stTemp = st;
    stTemp -= vec2(0.5);
    stTemp *= scale( vec2(0.5) + snoise(vec2(u_time * noiseSpeed  + 300.0, u_time * noiseSpeed  + 1300.0)) * noiseScale);
    stTemp *= rotate2d( (sin(u_time * 2.0) + snoise(vec2(u_time * noiseSpeed  + 2300.0, u_time * noiseSpeed  + 3300.0) * noiseScale)) * PI );
    stTemp += vec2(0.5);
    stTemp += vec2(snoise(vec2(u_time * noiseSpeed  + 4300.0, u_time * noiseSpeed  + 5300.0)) * noiseScale, snoise(vec2(u_time * noiseSpeed  + 6300.0, u_time * noiseSpeed  + 7300.0)) * noiseScale);
    color += vec3(0, cross(stTemp, 0.2), 0);
    
    // Blue:
    stTemp = st;
    stTemp -= vec2(0.5);
    stTemp *= scale( vec2(0.5) + snoise(vec2(u_time * noiseSpeed  + 700.0, u_time * noiseSpeed  + 1700.0)) * noiseScale);
    stTemp *= rotate2d( (sin(u_time * 2.0) + snoise(vec2(u_time * noiseSpeed  + 2700.0, u_time * noiseSpeed  + 3700.0) * noiseScale)) * PI );
    stTemp += vec2(0.5);
    stTemp += vec2(snoise(vec2(u_time * noiseSpeed  + 4700.0, u_time * noiseSpeed  + 5700.0)) * noiseScale, snoise(vec2(u_time * noiseSpeed  + 6700.0, u_time * noiseSpeed  + 7700.0)) * noiseScale);
    color += vec3(0, 0, cross(stTemp, 0.2));

    gl_FragColor = vec4(color,1.0);
}