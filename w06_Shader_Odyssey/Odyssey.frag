/// Odyssey - A Film Made of Fragment Shaders
/// Author: Weili Shi
/// E-mail: me@shi-weili.com
 
#ifdef GL_ES
precision mediump float;
#endif

#define AA 0.002    // Anti-aliasing factor
#define PI 3.14159265359

uniform vec2 u_resolution;
uniform float u_time;

float time = u_time + 0.0;

// Global variables for coordinates and color:
vec2 st = vec2(0.0);
vec2 sti = vec2(0.0);
vec2 stf = vec2(0.0);
vec2 drift = vec2(0.0);
float scaleFactor = 1.0;
float rotation = 0.0;
vec3 color = vec3(0.0);

// Global variables for scene mask's coordinates and color:
vec2 mSt = vec2(0.0);
vec2 mSti = vec2(0.0);
vec2 mStf = vec2(0.0);
vec2 mDrift = vec2(0.0);
float mScaleFactor = 1.0;
float mRotation = 0.0;
vec3 mColor = vec3(0.0);
float mPct = 0.0;

///--------------------------------------------------------------------------------
/// Matrix manipulation.
/// shift(), scale() and rotate() are decoupled;
/// They can be called in any sequence without confusing each other.
/// Notice that (0.5, 0.5) is considered as the center of the scene.

mat2 rotateMatrix(float angle) {
    /// Angle in radians.

    return mat2(cos(angle), -sin(angle),
                sin(angle), cos(angle));

}

void shift(inout vec2 st, out vec2 sti, out vec2 stf, out vec2 drift, vec2 v) {
    /// Move the screen position of (0.5, 0.5) with current scaleFactor in mind.
    /// Won't be affected by rotation.

    st *= rotateMatrix(-1.0 * rotation);
    st /= scaleFactor;

    st += v / scaleFactor;

    st *= scaleFactor;
    st *= rotateMatrix(rotation);

    drift += v;
    sti = floor(st);
    stf = fract(st);

}

void shift(vec2 v) {
    
    shift(st, sti, stf, drift, v);

}

void shiftMask(vec2 v) {

    shift(mSt, mSti, mStf, mDrift, v);

}

void shift(float x, float y) {

    shift(st, sti, stf, drift, vec2(x, y));

}

void shiftMask(float x, float y) {

    shift(mSt, mSti, mStf, mDrift, vec2(x, y));

}

void scale(inout vec2 st, out vec2 sti, out vec2 stf, out float scaleFactor, float factor) {
    /// Scale about (0.5, 0.5).

    st -= 0.5;
    st *= factor;
    st += 0.5;

    scaleFactor *= factor;

    sti = floor(st);
    stf = fract(st);

}

void scale(float factor) {

    scale(st, sti, stf, scaleFactor, factor);

}

void scaleMask(float factor) {

    scale(mSt, mSti, mStf, mScaleFactor, factor);

}

void rotate(inout vec2 st, out vec2 sti, out vec2 stf, out float rotation, float angle) {
    /// Rotate around (0.5, 0.5).
    /// Angle in radians.

    st -= 0.5;
    st *= rotateMatrix(angle);
    st += 0.5;

    rotation = mod(rotation + angle, 2.0 * PI);
    sti = floor(st);
    stf = fract(st);

}

void rotate(float angle) {
    
    rotate(st, sti, stf, rotation, angle);

}

void rotateMask(float angle) {
    
    rotate(mSt, mSti, mStf, mRotation, angle);

}

void prepareCoordiantes() {
    /// Get the coordinate, make it apsect-ratio free;
    st = gl_FragCoord.xy / u_resolution.xy;
    mSt = gl_FragCoord.xy / u_resolution.xy;

    // Make the scene aspect-ratio free:
    st.x *= u_resolution.x / u_resolution.y;
    mSt.x *= u_resolution.x / u_resolution.y;

    // Shift (0, 0) to the center of the screen:
    st.x -= 0.5 * u_resolution.x / u_resolution.y;
    st.y -= 0.5;
    mSt.x -= 0.5 * u_resolution.x / u_resolution.y;
    mSt.y -= 0.5;

    // Shift (0.5, 0.5) to the center of the screen:
    st += 0.5;
    mSt += 0.5;

    sti = floor(st);
    stf = fract(st);
    mSti = floor(mSt);
    mStf = fract(mSt);
}

///--------------------------------------------------------------------------------
/// Color blending.

vec3 blend(vec3 upperLayer, vec3 downLayer, float opacity) {

    return mix(downLayer, upperLayer, opacity);

}

vec3 mask(vec3 upperLayer, vec3 downLayer, float mask, float opacity) {
    /// mask is usually related to the shape of upperLayer.
    /// opacity is usually a constant.

    return mix(downLayer, upperLayer, mask * opacity);

}

vec3 paste(vec3 upperLayer, vec3 downLayer) {
    /// Only paste non-blank (non-black) part of the upperLayer on top of the downLayer.
    /// Suitable for solid shapes.

    float opacity = (upperLayer.x > 0.0 || upperLayer.y > 0.0 || upperLayer.z > 0.0) ? 1.0 : 0.0;
    return mix(downLayer, upperLayer, opacity);

}

vec3 screen(vec3 upperLayer, vec3 downLayer) {
    /// The screen blend mode results in a brighter picture.

    return vec3(1.0) - (vec3(1.0) - downLayer) * (vec3(1.0) - upperLayer);

}

vec3 rgb(int r, int g, int b) {
    /// Return a vector float representation of the integer RGB color.

    return vec3(float(r), float(g), float(b)) / 255.0;

}

vec3 rgb(float r, float g, float b) {
    /// Return a vector representation of the RGB color.

    return vec3(r, g, b);

}

vec3 tint(vec3 shape, vec3 color) {
    /// Tint white shape with color.
    /// Suitable for solid shapes.

    return shape * color;

}

vec3 tint(float shape, vec3 color) {

    return vec3(shape) * color;

}

vec3 blackScene() {

    return vec3(0.0);

}

///--------------------------------------------------------------------------------
/// Basic shapes.
/// All shapes are white, on a black background.

float circle(vec2 st, vec2 center, float radius) {

    float d = distance(st, center);

    return 1.0 - smoothstep(radius - AA,
                         radius + AA,
                         d);

}

float circle(vec2 st, float radius) {
    /// Centered at (0.5, 0.5).

    return circle(st, vec2(0.5), radius);

}

float gCircle(vec2 st, vec2 center, float startDistance, float endDistance) {
    /// Circular graident.

    float d = distance(st, center);

    return smoothstep(endDistance, startDistance, d);

}

float gCircle(vec2 st, float startDistance, float endDistance) {
    /// Centered at (0.5, 0.5).

    return gCircle(st, vec2(0.5), startDistance, endDistance);

}

float quadrant(vec2 st, float radius, int position) {
    /// Position 0: bottom-left
    /// Position 1: top-left
    /// Position 2: top-right
    /// Position 3: bottom-right

    float d;

    if(position == 0) {
        d = distance(st, vec2(0.0, 0.0));
    } else if(position == 1) {
        d = distance(st, vec2(0.0, 1.0));
    } else if(position == 2) {
        d = distance(st, vec2(1.0, 1.0));
    } else {
        d = distance(st, vec2(1.0, 0.0));
    }

    return 1.0 - smoothstep(radius - AA,
                         radius + AA,
                         d);
}

float irTriangle(vec2 st, int position) {
    /// Isosceles right triangle
    /// Position 0: bottom-left
    /// Position 1: top-left
    /// Position 2: top-right
    /// Position 3: bottom-right

    float difference;

    if(position == 0) {
        difference = (1.0 - st.x) - st.y;
    } else if(position == 1) {
        difference = st.y - st.x;
    } else if(position == 2) {
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
    /// Position 0: left
    /// Position 1: right
    /// Position 2: top
    /// Position 3: bottom

    if(position == 0) {
        return smoothstep(0.5 - AA, 0.5 + AA, 1.0 - st.x);
    } else if(position == 1) {
        return smoothstep(0.5 - AA, 0.5 + AA, st.x);
    } else if(position == 2) {
        return smoothstep(0.5 - AA, 0.5 + AA, st.y);
    } else {
        return smoothstep(0.5 - AA, 0.5 + AA, 1.0 - st.x);
    }

}

float polygon(vec2 st, float radius, int n) {
    /// N-sided regular polygon, with the bottom edge horizontal.
    /// n should be no less than 3.

    float nf = float(n);

    st -= vec2(0.5);
    float theta = atan(st.y, st.x) + (PI / 2.0);

    float edge = radius * (cos(PI / nf) / cos(theta - (2.0 * PI / nf) * floor((nf * theta + PI) / (2.0 * PI))));

    return 1.0 - smoothstep(edge - AA,
                            edge + AA,
                            length(st));

}

///--------------------------------------------------------------------------------
/// Utility functions.

float random(vec2 st) {

    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);

}

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

/// GLSL 2D simplex noise function
///      Author : Ian McEwan, Ashima Arts
///  Maintainer : ijm
///     Lastmod : 20110822 (ijm)
///     License : 
///  Copyright (C) 2011 Ashima Arts. All rights reserved.
///  Distributed under the MIT License. See LICENSE file.
///  https://github.com/ashima/webgl-noise

/// Notice that snoise ranges from -1.0 to 1.0!

float snoise(vec2 v) {

    // Precompute values for skewed triangular grid
    const vec4 C = vec4(0.211324865405187,
                        // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  
                        // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  
                        // -1.0 + 2.0 * C.x
                        0.024390243902439); 
                        // 1.0 / 41.0

    // First corner (x0)
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    // Other two corners (x1, x2)
    vec2 i1 = vec2(0.0);
    i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
    vec2 x1 = x0.xy + C.xx - i1;
    vec2 x2 = x0.xy + C.zz;

    // Do some permutations to avoid
    // truncation effects in permutation
    i = mod289(i);
    vec3 p = permute(
            permute( i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(
                        dot(x0,x0), 
                        dot(x1,x1), 
                        dot(x2,x2)
                        ), 0.0);

    m = m*m ;
    m = m*m ;

    // Gradients: 
    //  41 pts uniformly over a line, mapped onto a diamond
    //  The ring size 17*17 = 289 is close to a multiple 
    //      of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt(a0*a0 + h*h);
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

    // Compute final noise value at P
    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
}

float snoise01(vec2 v) {
    /// Ranges from 0.0 to 1.0.

    return snoise(v) * 0.5 + 0.5;

}

///--------------------------------------------------------------------------------
/// Scene 1

vec3 sun(vec2 st, vec2 center) {

    vec3 sunColor = rgb(0.86, 0.84, 0.83) * 1.2;
    float radius = 0.05;

    float pct = circle(st, center, radius);
    vec3 color = tint(pct, sunColor);

    return color;

}

vec3 halo(vec2 st, vec2 center, float radius) {

    vec3 innerColor = vec3(1.0, 1.0, 1.0) * 0.7;
    vec3 middleColor = vec3(1.0, 0.2, 0.2) * 0.3;
    vec3 outterColor = vec3(0.5, 1.0, 0.5) * 0.12;

    float pct1 = gCircle(st, center, radius * 0.0, radius * 0.4);
    vec3 color1 = tint(pct1, innerColor);

    float pct2 = gCircle(st, center, radius * 0.25, radius * 0.82);
    vec3 color2 = tint(pct2, middleColor);

    float pct3 = gCircle(st, center, radius * 0.5, radius * 0.95);
    vec3 color3 = tint(pct3, outterColor);

    vec3 color = screen(color2, color3);
    color = screen(color1, color);
    return color;

}

vec3 earth(vec2 st) {

    vec2 center = vec2(0.5, 0.4);
    float radius = 0.25;
    vec3 earthColor = rgb(0.65, 0.68, 0.65);

    float pct = circle(st, center, radius);
    vec3 color = tint(pct, earthColor);

    vec2 relativePosition = st - center;

    vec3 noise = vec3(snoise(relativePosition * 50.0));
    color = mask(noise, color, pct, 0.01);

    noise = vec3(snoise(relativePosition * 150.0));
    color = mask(noise, color, pct, 0.015);

    noise = vec3(snoise(relativePosition * 500.0));
    color = mask(noise, color, pct, 0.02);

    return color;

}

vec3 earthGradient(vec2 st) {

    vec2 center = vec2(0.5, 0.4);
    float radius = 0.25;

    vec3 gradient = vec3(gCircle(st, center - vec2(0.0, radius * 0.25), radius * 0.95, radius * 1.25));
    gradient *= 0.9;

    return gradient;

}

float earthShape(vec2 st) {

    vec2 center = vec2(0.5, 0.4);
    float radius = 0.25;
    float pct = circle(st, center, radius);
    return pct;
}

vec3 moon(vec2 st, vec2 center) {

    vec3 moonColor = rgb(0.03, 0.05, 0.10) * 0.7;
    float radius = 1.2;

    float pct = circle(st, center, radius);
    vec3 color = tint(pct, moonColor);

    vec2 relativePosition = st - center;

    vec3 noise = vec3(snoise(relativePosition * 5.0));
    color = mask(noise, color, pct, 0.015);

    noise = vec3(snoise(relativePosition * 50.0));
    color = mask(noise, color, pct, 0.01);

    noise = vec3(snoise(relativePosition * 150.0));
    color = mask(noise, color, pct, 0.015);

    noise = vec3(snoise(relativePosition * 500.0));
    color = mask(noise, color, pct, 0.02);

    vec3 gradient = vec3(gCircle(st, center - vec2(0.0, radius * 0.25), radius * 0.9, radius * 1.2));
    color -= gradient * 0.5;

    return color;

}

float moonShape(vec2 st, vec2 center) {

    float radius = 1.2;
    float pct = circle(st, center, radius);
    return pct;

}

vec3 scene1(float startTime) {

    float time = time - startTime;
    vec3 color = vec3(0.0);

    // Sun:
    vec2 sunCenterStart = vec2(0.5, 0.55);
    float sunTotalMileage = 0.2;
    float sunTotalTime = 35.0;
    float sunVelocity = sunTotalMileage / sunTotalTime;
    vec2 sunCenter = vec2(0.0);

    // Earth:

    // Halo:
    float haloRadiusStart = 0.05;
    float haloRadiusEnd = 0.3;
    float haloTotalTime = 35.0;
    float haloRadiusVelocity = (haloRadiusEnd - haloRadiusStart) / haloTotalTime;
    float haloRadius = 0.0;

    // Moon:
    vec2 moonCenterStart = vec2(0.5, -0.4);
    float moonTotalMileage = 0.8;
    float moonTotalTime = 35.0;
    float moonVelocity = moonTotalMileage / moonTotalTime;
    vec2 moonCenter = vec2(0.0);

    if(time <= 36.0) {

        // Sun:
        sunCenter = vec2(sunCenterStart + vec2(0.0, sunVelocity * time));
        vec3 sunImage = sun(st, sunCenter);
        color = sunImage;

        // Earth:
        vec3 earthImage = earth(st);
        float earthMask = earthShape(st);
        color = mask(earthImage, color, earthMask, 1.0);

        // Halo:
        haloRadius = haloRadiusStart + haloRadiusVelocity * time;
        vec3 haloImage = halo(st, sunCenter, haloRadius);
        color = screen(haloImage, color);

        // Earth Gradient:
        vec3 earthGradientImage = earthGradient(st);
        color -= earthGradientImage;

        // Moon:
        moonCenter = vec2(moonCenterStart - vec2(0.0, moonVelocity * time));
        vec3 moonImage = moon(st, moonCenter);
        float moonMask = moonShape(st, moonCenter);
        color = mask(moonImage, color, moonMask, 1.0);

    } else {

        // Matrix manipulation:
        float scaleVelocity = 6.0 / 4.0; // times / seconds
        float scaleTime = time - 36.0;
        scale(1.0 + scaleVelocity * scaleTime);

        // Sun:
        sunCenter = vec2(sunCenterStart + vec2(0.0, sunVelocity * 36.0));
        vec3 sunImage = sun(stf, sunCenter);
        color = sunImage;

        // Earth:
        vec3 earthImage = earth(stf);
        float earthMask = earthShape(stf);
        color = mask(earthImage, color, earthMask, 1.0);

        // Halo:
        haloRadius = haloRadiusStart + haloRadiusVelocity * 36.0;
        vec3 haloImage = halo(stf, sunCenter, haloRadius);
        color = screen(haloImage, color);

        // Earth Gradient:
        vec3 earthGradientImage = earthGradient(stf);
        color -= earthGradientImage;

        // Fade in duplicates:
        if(distance(sti, vec2(0.0, 0.0)) >= 0.001) { // Duplicates

            float duplicatesFadeInTime = 1.0;
            float duplicatesFadeInVelocity = 1.0 / duplicatesFadeInTime;
            float duplicatesOpacity = duplicatesFadeInVelocity * (time - 36.0);
            duplicatesOpacity = duplicatesOpacity <= 1.0 ? duplicatesOpacity : 1.0;

            color *= duplicatesOpacity;

        }

    }

    // Fade-in:
    float blackSceneFadeInTime = 10.0;
    float blackSceneFadeInVelocity = 1.0 / blackSceneFadeInTime;
    float blackSceneOpacity = 1.0 - blackSceneFadeInVelocity * time;

    if(blackSceneOpacity >= 0.0) {

        vec3 blackScreen = blackScene();
        color = blend(blackScreen, color, blackSceneOpacity);

    }

    return color;

}

///--------------------------------------------------------------------------------
/// Scene 2

vec3 scene2(float startTime) {

    float time = time - startTime;
    vec3 color = vec3(0.0);

    scale(3.0);

    // Gradient for bumps:
    float bumpStartTime = 15.0;
    float bumpStep = 0.4;   // in seconds
    float bumpTime = time - bumpStartTime;
    float bumpStrength = 2.5;
    float bumpSize = 0.45;

    if(bumpTime >= 0.0 && 
        distance(sti, vec2(0.0, 0.0)) < 0.001 ) {

        st += gCircle(stf, 0.0, bumpSize) * bumpStrength;

    } else if(bumpTime >= bumpStep * 1.0 && 
            (distance(sti, vec2(1.0, 1.0)) < 0.001 || 
                distance(sti, vec2(-1.0, -1.0)) < 0.001)) {

        st += gCircle(stf, 0.0, bumpSize) * bumpStrength;

    } else if(bumpTime >= bumpStep * 2.0 && 
            (distance(sti, vec2(-2.0, 1.0)) < 0.001 || 
                distance(sti, vec2(2.0, -1.0)) < 0.001)) {

        st += gCircle(stf, 0.0, bumpSize) * bumpStrength;

    } else if(bumpTime >= bumpStep * 3.0 && 
            (distance(sti, vec2(0.0, 1.0)) < 0.001 || 
                distance(sti, vec2(0.0, -1.0)) < 0.001)) {

        st += gCircle(stf, 0.0, bumpSize) * bumpStrength;

    } else if(bumpTime >= bumpStep * 4.0 && 
            (distance(sti, vec2(3.0, 0.0)) < 0.001 || 
                distance(sti, vec2(-3.0, 0.0)) < 0.001)) {

        st += gCircle(stf, 0.0, bumpSize) * bumpStrength;

    } else if(bumpTime >= bumpStep * 5.0 && 
            (distance(sti, vec2(2.0, 1.0)) < 0.001 || 
                distance(sti, vec2(-2.0, -1.0)) < 0.001)) {

        st += gCircle(stf, 0.0, bumpSize) * bumpStrength;

    } else if(bumpTime >= bumpStep * 6.0 && 
            (distance(sti, vec2(-1.0, 1.0)) < 0.001 || 
                distance(sti, vec2(1.0, -1.0)) < 0.001)) {

        st += gCircle(stf, 0.0, bumpSize) * bumpStrength;

    } else if(bumpTime >= bumpStep * 7.0 && 
            (distance(sti, vec2(2.0, 0.0)) < 0.001 || 
                distance(sti, vec2(-2.0, 0.0)) < 0.001)) {

        st += gCircle(stf, 0.0, bumpSize) * bumpStrength;

    } else if(bumpTime >= bumpStep * 8.0 && 
            (distance(sti, vec2(3.0, 1.0)) < 0.001 || 
                distance(sti, vec2(-3.0, -1.0)) < 0.001)) {

        st += gCircle(stf, 0.0, bumpSize) * bumpStrength;

    } else if(bumpTime >= bumpStep * 9.0 && 
            (distance(sti, vec2(1.0, 0.0)) < 0.001 || 
                distance(sti, vec2(-1.0, 0.0)) < 0.001)) {

        st += gCircle(stf, 0.0, bumpSize) * bumpStrength;

    } else if(bumpTime >= bumpStep * 10.0 && 
            (distance(sti, vec2(-3.0, 1.0)) < 0.001 || 
                distance(sti, vec2(3.0, -1.0)) < 0.001)) {

        st += gCircle(stf, 0.0, bumpSize) * bumpStrength;

    }

    // Gradient for ripples:

    // Ripple scale:
    float rippleScale = 0.0;
    float rippleScaleStartTime = 0.0;
    float rippleScaleEndTime = 15.0;
    float rippleScaleVelocity = 1.0 / (rippleScaleEndTime - rippleScaleStartTime);
    rippleScale = 0.7 * (rippleScaleVelocity * (time - rippleScaleStartTime));
    if(rippleScale > 0.7) {
        rippleScale = 0.7;
    }

    // Ripple drift:
    float rippleDrift = 0.0;

    if (time > 5.0) {
    
        float driftScaleStartTime = 5.0;
        float driftScaleEndTime = 15.0;
        float driftScaleVelocity = 1.0 / (driftScaleEndTime - driftScaleStartTime);
        float driftScale = 0.1 * (time - driftScaleStartTime) * driftScaleVelocity;
        if(driftScale > 0.1) {
            driftScale = 0.1;
        }
        rippleDrift = (time - 5.0) * driftScale;

    }

    st += snoise((st * rippleScale) + vec2(0.0, rippleDrift));

    // Draw patterns:
    float patternSacleFactor = 2.0;
    color += smoothstep(0.0, 1.0, snoise(st * patternSacleFactor)) * 1.8; // Big drops
    color += smoothstep(0.3, 0.7, snoise(st * patternSacleFactor)) * 1.; // Splatter
    color -= smoothstep(0.45, 0.55, snoise(st * patternSacleFactor)) * 0.5; // Holes on splatter

    // Overall gradient:
    color += smoothstep(0.0, 1.0, st.y) * 0.6;

    // Tint:
    vec3 liquidColor = rgb(1.0, 0.5, 0.3);
    color = tint(color, liquidColor);

    return color;

}

///--------------------------------------------------------------------------------
/// Scene 3

vec3 scene3(float startTime) {

    float time = time - startTime;
    vec3 color = vec3(0.0);

    
    // Draw background:
    if(time < 19.0) { // Draw quadrants.

        scale(150.0);
        color = vec3(quadrant(stf, 0.5, int(snoise01(time * 1.0 + sti * PI) * 4.0)));

    } else { // Draw circles.

        scale(100.0 * sin((time - 19.0 + (PI / 2.0)) * 1.0));
        color = vec3(circle(stf, 0.25));

    }

    // Scale mask:
    if(time <= 1.0) {

        scaleMask(3.0);

    } else {

        float maskScaleStart = 3.0;
        float maskSacleEnd = 0.1;
        float maskSacleStartTime = 1.0;
        float maskScaleEndTime = 25.0;
        float maskScaleVelocity = (maskSacleEnd - maskScaleStart) / (maskScaleEndTime - maskSacleStartTime);
        float maskScale = maskScaleStart + maskScaleVelocity * (time - maskSacleStartTime);
        if(maskScale < maskSacleEnd) {
            maskScale = maskSacleEnd;
        }
        scaleMask(maskScale);

    }

    // Rotate mask:
    if(time >= 10.0) {

        rotateMask((time - 10.0) * 0.1);

    }

    // Change mask shape:
    float maskRadius = 0.4;

    if(time < 15.0) {

        mPct = circle(mStf, maskRadius);

    } else if(time <= 16.0) {

        mPct = polygon(mStf, maskRadius, 24);

    } else if(time <= 17.0) {

        mPct = polygon(mStf, maskRadius, 12);

    } else if(time <= 18.0) {

        mPct = polygon(mStf, maskRadius, 6);

    } else if(time <= 19.0) {

        mPct = polygon(mStf, maskRadius, 4);

    } else {

        mPct = polygon(mStf, maskRadius, 3);

    }

    // Draw mask:
    mColor = vec3(0.0);
    color = mask(color, mColor, mPct, 1.0);

    return color;

}

///--------------------------------------------------------------------------------

void main() {

    prepareCoordiantes();

    /// Now the center of the scene is the same as that of the window,
    /// and the scene will scale/duplicate about its center.
    /// The coordinate of the center of the window/main scene is (0.5, 0.5).
    /// When drawing using stf, the scence ranges from (0.0, 0.0) to (1.0, 1.0),

    if(time <= 40.0) {

        vec3 color1 = scene1(0.0);
        color = color1;

    } else if(time <= 45.0) {

        vec3 color1 = scene1(0.0);
        prepareCoordiantes();
        vec3 color2 = scene2(40.0);

        float fadeInTime = 5.0;
        float fadeInVelocity = 1.0 / fadeInTime;
        float opacity = fadeInVelocity * (time - 40.0);
        opacity = opacity <= 1.0 ? opacity : 1.0;
        opacity = opacity >= 0.0 ? opacity : 0.0;

        color = blend(color2, color1, opacity);

    } else if(time <= 59.0) {

        vec3 color2 = scene2(40.0);
        color = color2;

    } else if(time <= 60.0) {

        vec3 color2 = scene2(40.0);
        prepareCoordiantes();
        vec3 color3 = scene3(59.0);

        float fadeInTime = 1.0;
        float fadeInVelocity = 1.0 / fadeInTime;
        float opacity = fadeInVelocity * (time - 59.0);
        opacity = opacity <= 1.0 ? opacity : 1.0;
        opacity = opacity >= 0.0 ? opacity : 0.0;

        color = blend(color3, color2, opacity);

    } else if(time <= 90.0) {

        vec3 color3 = scene3(59.0);
        color = color3;

    } else {

        vec3 color3 = scene3(59.0);
        vec3 blackScreen = blackScene();

        float fadeInTime = 10.0;
        float fadeInVelocity = 1.0 / fadeInTime;
        float opacity = fadeInVelocity * (time - 90.0);
        opacity = opacity <= 1.0 ? opacity : 1.0;
        opacity = opacity >= 0.0 ? opacity : 0.0;

        color = blend(blackScreen, color3, opacity);

    }

    gl_FragColor = vec4(color, 1.0);

}