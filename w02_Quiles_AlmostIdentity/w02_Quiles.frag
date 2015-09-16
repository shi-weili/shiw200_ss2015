// Blinn-Wyvill Approximation to the Raised Inverted Cosine

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Plot a line on Y using a value between 0.0-1.0
float plot(vec2 st, float pct){
  return  smoothstep( pct-0.02, pct, st.y) - 
          smoothstep( pct, pct+0.02, st.y);
}

float almostIdentity( float x, float m, float n )
{
    if( x>m ) return x;

    float a = 2.0*n - m;
    float b = 2.0*m - 3.0*n;
    float t = x/m;

    return (a*t + b)*t*t + n;
}

void main() {
	vec2 st = gl_FragCoord.xy/u_resolution;

    float x, y;

    x = st.x;
    y = almostIdentity(x, 0.3, 0.1);

    vec3 color = vec3(y);
    
    // Plot a line
    float pct = plot(st,y);
    color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0);
    
	gl_FragColor = vec4(color,1.0);
}