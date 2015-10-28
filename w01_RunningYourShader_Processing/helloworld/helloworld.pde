PShader shader;

void setup() {
  size(1400, 600, P2D);
  noStroke();

  shader = loadShader("odyssey.frag");
}

void draw() {
 shader.set("u_resolution", float(width), float(height));
//  shader.set("u_mouse", float(mouseX), float(mouseY));
 shader.set("u_time", millis() / 1000.0);
  shader(shader);
  rect(0,0,width,height);
}