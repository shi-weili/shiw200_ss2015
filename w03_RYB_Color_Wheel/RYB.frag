#ifdef GL_ES
precision mediump float;
#endif

#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform float u_time;

//  Function from Iñigo Quiles 
//  https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0, 
                     0.0, 
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
}

// Double-Cubic Seat with Linear Blend from Golan Levin
// http://www.flong.com/texts/code/shapers_poly/

float doubleCubicSeatWithLinearBlend (float x, float a, float b){

  float epsilon = 0.00001;
  float min_param_a = 0.0 + epsilon;
  float max_param_a = 1.0 - epsilon;
  float min_param_b = 0.0;
  float max_param_b = 1.0;
  a = min(max_param_a, max(min_param_a, a));  
  b = min(max_param_b, max(min_param_b, b)); 
  b = 1.0 - b; //reverse for intelligibility.
  
  float y = 0.;
  if (x<=a){
    y = b*x + (1.-b)*a*(1.-pow(1.-x/a, 3.0));
  } else {
    y = b*x + (1.-b)*(a + (1.-a)*pow((x-a)/(1.-a), 3.0));
  }
  return y;
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);

    // Use polar coordinates instead of cartesian
    vec2 toCenter = vec2(0.5)-st;

    float angle = atan(toCenter.y,toCenter.x);

    float angle1 = angle / TWO_PI;
    angle1 += 0.5;

    // Expanding red, orange and yellow:
    angle1 = doubleCubicSeatWithLinearBlend(angle1, 0., 0.8);
    // Expanding blue and purple:
    angle1 = doubleCubicSeatWithLinearBlend(angle1, 0.88, 0.5);

    // angle1 -= 0.5;
    // angle1 *= TWO_PI;


    float radius = length(toCenter)*2.0;
  
    // Map the angle (-PI to PI) to the Hue (from 0 to 1)
    // and the Saturation to the radius
    if(radius <= 0.85) {
        // RYB color wheel:
        color = hsb2rgb(vec3(angle1, radius, 1.0));
    } else {
        // HSB color wheel:
        color = hsb2rgb(vec3((angle/TWO_PI)+0.5,radius,1.0));
    }

    gl_FragColor = vec4(color,1.0);
}