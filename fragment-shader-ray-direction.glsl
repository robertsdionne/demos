precision mediump float;

varying highp vec3 unnormalized_ray;

void main() {
  vec3 ray_color = (normalize(unnormalized_ray) + vec3(1.)) / 2.;
  gl_FragColor = vec4(ray_color, 1.);
}
