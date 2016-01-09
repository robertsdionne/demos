precision mediump float;

uniform highp vec3 translate;

varying highp vec3 unnormalized_ray;

float DistanceTo(vec3 position);
float DistanceToSpheres(vec3 position);
float DistanceToSphere(vec3 position);
float DistanceToPlane(vec3 position, vec4 normal);
vec4 VectorToColor(vec3 vector);

#define M_PI 3.14159265358979323846264338327950288

const highp float kEpsilon = 1.e-4;
const highp vec3 kLightDirection = normalize(vec3(1., 1., 1.));

void main() {
  highp vec3 ray = unnormalized_ray;
//      ray.xy *= vec2(M_PI / 2.);
//      highp float theta = 2. * acos(cos(ray.x / 2.) * cos(ray.y / 2.));
//      ray.xy = -normalize(ray.xy) * log(cos(theta));
  ray = normalize(ray);
  highp vec3 position = vec3(0.) + vec3(0., 0., 50.);

  lowp float hit = 0.;
  for (int i = 0; i < 128; ++i) {
    highp float distance = DistanceTo(position);
    position += distance * ray * (1. - (hit = float(distance < kEpsilon)));
  }

  highp vec3
      dx = vec3(kEpsilon, 0., 0.),
      dy = vec3(0., kEpsilon, 0.),
      dz = vec3(0., 0., kEpsilon);

  highp vec3 normal = normalize(vec3(
      DistanceTo(position + dx) - DistanceTo(position - dx),
      DistanceTo(position + dy) - DistanceTo(position - dy),
      DistanceTo(position + dz) - DistanceTo(position - dz)));

  highp float intensity = clamp(dot(normal, kLightDirection), 0., 1.);

  highp vec4 ray_color = VectorToColor(ray),
      normal_color = VectorToColor(normal);

  gl_FragColor = mix(ray_color, vec4(normal_color.xyz * intensity, 1.), hit);
}

float DistanceTo(vec3 position) {
  const highp float d = 50.;
  return max(
    max(
      max(
        DistanceToPlane(position, vec4(1, 0, 0, d)),
        DistanceToPlane(position, vec4(0, 1, 0, d))),
      max(
        DistanceToPlane(position, vec4(-1, 0, 0, d)),
        DistanceToPlane(position, vec4(0, -1, 0, d)))),
    DistanceToSpheres(position));
}

float DistanceToSpheres(vec3 position) {
  highp vec3 q = position;
  q.xy = mod(q.xy, 2.) - 0.5 * 2.;
  return DistanceToSphere(q);
}

float DistanceToSphere(vec3 position) {
  return length(position) - 1.;
}

float DistanceToPlane(vec3 position, vec4 normal) {
  return dot(position, normal.xyz) - normal.w;
}

vec4 VectorToColor(vec3 vector) {
  return vec4((normalize(vector) + vec3(1.)) / 2., 1.);
}
