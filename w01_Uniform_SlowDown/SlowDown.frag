#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;

void main() {
	gl_FragColor = vec4( abs(sin(log(u_time) * 4.)), 0.0,0.0,1.0);
}