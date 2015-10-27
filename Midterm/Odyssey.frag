/// Odyssey - A Film Made of Fragment Shaders
/// Author: Weili Shi
/// E-mail: me@shi-weili.com

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define AA 0.002    // Anti-aliasing factor


///--------------------------------------------------------------------------------
/// Matrix manipulation.

mat2 rotate(float angle){

    return mat2(cos(angle), -sin(angle),
                sin(angle), cos(angle));

}

///--------------------------------------------------------------------------------
/// Utility functions.

float random(vec2 st) {

    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);

}

///--------------------------------------------------------------------------------
/// Draw basic shapes.
/// All shapes are white, on a black background.

float circle(vec2 st, float radius) {
    /// Centered at (0.5, 0.5).

    float distance = distance(st, vec2(0.5));

    return 1.0 - smoothstep(radius - AA,
                         radius + AA,
                         distance);

}

float quadrant(vec2 st, float radius, int position) {
    /// Position 1: bottom-left
    /// Position 2: top-left
    /// Position 3: top-right
    /// Position 4: bottom-right

    float distance;

    if(position == 1) {
        distance = distance(st, vec2(0.0, 0.0));
    } else if(position == 2) {
        distance = distance(st, vec2(0.0, 1.0));
    } else if(position == 3) {
        distance = distance(st, vec2(1.0, 1.0));
    } else {
        distance = distance(st, vec2(1.0, 0.0));
    }

    return 1.0 - smoothstep(radius - AA,
                         radius + AA,
                         distance);
}

float triangle(vec2 st, int position) {
    /// Isosceles right triangle
    /// Position 1: bottom-left
    /// Position 2: top-left
    /// Position 3: top-right
    /// Position 4: bottom-right

    float difference;

    if(position == 1) {
        difference = (1.0 - st.x) - st.y;
    } else if(position == 2) {
        difference = st.y - st.x;
    } else if(position == 3) {
        difference = st.y - (1.0 - st.x);
    } else {
        difference = st.x - st.y;
    }

    return smoothstep(-0.01, 0.01, difference);

}

float box(vec2 st, float size) {

    float edge = (1.0 - size) / 2.0;

    return smoothstep(0.0 + edge - AA, 0.0 + edge + AA, st.x) *
            smoothstep(0.0 + edge - AA, 0.0 + edge + AA, st.y) *
            (1.0 - smoothstep(1.0 - edge - AA, 1.0 - edge + AA, st.x)) *
            (1.0 - smoothstep(1.0 - edge - AA, 1.0 - edge + AA, st.y));
}

float halfSquare(vec2 st, int position) {
    /// Position 1: left
    /// Position 2: right
    /// Position 3: top
    /// Position 4: bottom

    if(position == 1) {
        return smoothstep(0.5 - AA, 0.5 + AA, 1.0 - st.x);
    } else if(position == 2) {
        return smoothstep(0.5 - AA, 0.5 + AA, st.x);
    } else if(position == 3) {
        return smoothstep(0.5 - AA, 0.5 + AA, st.y);
    } else {
        return smoothstep(0.5 - AA, 0.5 + AA, 1.0 - st.x);
    }

}


///--------------------------------------------------------------------------------

void main() {

    /// Get the coordinate, make it apsect-ratio free;
    /// scale it about the center of the scene/window;
    /// and duplicate the scene:
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    // Aspect Ratio:
    st.x *= u_resolution.x/u_resolution.y;

    // Shift (0, 0) to center:
    st.x -= 0.5 * u_resolution.x/u_resolution.y;
    st.y -= 0.5;

    // Scale:
    st *= 1.0;
    // st *= 100.0 * sin(u_time * 2.0);

    // Shift (0.5, 0.5) to center:
    st.x += 0.5;
    st.y += 0.5;

    // Duplicate scene:
    vec2 sti = floor(st);
    vec2 stf = fract(st);

    /// Now the center of the scene is the same as that of the window,
    /// and the scene will scale/duplicate about its center.
    /// The coordinate of the center of the window/main scene is (0.5, 0.5).
    /// When duplicating, the scence ranges from (0.0, 0.0) to (1.0, 1.0),
    
    vec3 color = vec3(circle(stf, 0.5));
    color = vec3(quadrant(stf, 0.5, int(random(u_time/100000.0 + sti) * 4.0)) );
    // color = vec3(triangle(stf, int(random(u_time/100000.0 + sti) * 4.0)));
    // color = vec3(box(stf, 0.5));
    // color = vec3(halfSquare(stf, int(random(u_time/100000.0 + sti) * 4.0)));

    gl_FragColor = vec4(color, 1.0);

}