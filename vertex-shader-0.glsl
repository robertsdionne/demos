precision mediump float;

attribute vec3 position;

varying vec3 unnormalized_ray;

void main() {
  unnormalized_ray = position;
  gl_Position = vec4(position, 1.);
}
