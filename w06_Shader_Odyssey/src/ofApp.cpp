#include "ofApp.h"

ofShader shader;
ofPlanePrimitive plane;
ofSoundPlayer soundtrack;

float shaderWidth;
float shaderHeight;
float shaderTop;

//--------------------------------------------------------------
void ofApp::setup(){

    ofBackground(0);
    ofEnableDepthTest();
    
    shaderWidth = ofGetWidth();
    shaderHeight = ofGetWidth() / 7 * 3;
    shaderTop = (ofGetHeight() - shaderHeight) / 2;

    shader.load("odyssey");
    
    plane.set(shaderWidth, shaderHeight);
    plane.setPosition(shaderWidth / 2, shaderHeight / 2, 0);
    
    soundtrack.loadSound("soundtrack.mp3");
    soundtrack.setVolume(1.0);
    soundtrack.play();
    
}

//--------------------------------------------------------------
void ofApp::update(){

    ofSoundUpdate();
    
}

//--------------------------------------------------------------
void ofApp::draw(){

    shader.begin();
    
//    ofPushMatrix();
//    ofTranslate(0, shaderTop);
    
    shader.setUniform1f("u_time", ofGetElapsedTimef());
    shader.setUniform2f("u_resolution", shaderWidth, shaderHeight);
    
    plane.draw();
    
//    ofPopMatrix();
    shader.end();
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){

}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}
