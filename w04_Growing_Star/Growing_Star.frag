#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Reference to
// http://thndl.com/square-shaped-shaders.html

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  vec3 color = vec3(0.0);
  float d = 0.0;

  // Remap the space to -1. to 1.
  st = st *2.-1.;

  // Radii:
  float outterRadius = 0.5;
  float innerRadius = 0.25;

// Number of sides of your shape

  float N = sin(u_time * 0.2) * 20.;

  // Angle and radius from the current pixel
  float a = atan(st.x,st.y)+PI;
  float r;
  
  float segment = floor(a / (TWO_PI / (2. * N)));
  a = mod(a, (TWO_PI / (2. * N)));
  if(mod(segment, 2.) < 0.01) {

    r = pow(((TWO_PI / (2. * N)) - a) / (TWO_PI / (2. * N)), 1.5) * (outterRadius - innerRadius) + innerRadius;

  } else {

    r = pow(a / (TWO_PI / (2. * N)), 1.5) * (outterRadius - innerRadius) + innerRadius;

  }

  // Shaping function that modulate the distance
  d = cos(floor(.5+a/r)*r-a)*length(st);

  color = vec3(1.0-smoothstep(r,r + 0.01,d));
  // color = vec3(d);

  gl_FragColor = vec4(color,1.0);
}