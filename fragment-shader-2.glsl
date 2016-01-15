precision mediump float;

uniform sampler2D sampler;

varying highp vec3 unnormalized_ray;

#define M_PI 3.14159265358979323846264338327950288

const highp float kEpsilon = 1.e-4;

void main() {
  highp vec3 ray = unnormalized_ray;
  // ray = normalize(ray);
  //
  // ray.xy *= M_PI / 4.0;
  //
  // highp float x = cos(ray.y) * sin(ray.x);
  // highp float y = sin(ray.y);

  // ray.xy = vec2(x, y);

  vec2 texture_coordinate = (ray.xy + 1.) / 2.;

  gl_FragColor = texture2D(sampler, texture_coordinate);
}
