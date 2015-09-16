#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159
#define E 2.71828

uniform float u_time;

void main() {
	gl_FragColor = vec4( abs(sin(u_time)), abs(sin(u_time / PI)), abs(sin(u_time / E)),1.0);
}