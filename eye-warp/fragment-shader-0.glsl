precision mediump float;

uniform highp vec3 translate;
uniform highp vec3 hidden;

varying highp vec3 unnormalized_ray;

float DistanceTo(vec3 position);
float DistanceToSpheres(vec3 position);
float DistanceToSphere(vec3 position);
float DistanceToPlane(vec3 position, vec4 normal);
vec4 VectorToColor(vec3 vector);

#define M_PI 3.14159265358979323846264338327950288

const highp float kEpsilon = 1.e-3;
const highp vec3 kLightDirection = normalize(vec3(1., 1., 1.));

highp vec3 rotateX(highp vec3 pos, highp float a) {
        highp mat3 r = mat3(1);
        r[1][1] = cos(a);
        r[2][1] = sin(a);
        r[1][2] = -sin(a);
        r[2][2] = cos(a);
        return r * pos;
      }

highp vec3 rotateY(highp vec3 pos, highp float a) {
        highp mat3 r = mat3(1);
        r[0][0] = cos(a);
        r[2][0] = sin(a);
        r[0][2] = -sin(a);
        r[2][2] = cos(a);
        return r * pos;
      }

highp vec3 rotate(highp vec3 pos, highp vec3 a) {
  return rotateY(rotateX(pos, a.x), a.y);
}

float column(vec3 pos) {
  pos.y -= .5;
        highp float distTop = dot(pos, vec3(0.0, 1.0, 0.0))-2.0;
        highp float distBottom = dot(pos, vec3(0.0, -1.0, 0.0))-2.0;
        highp float theta = atan(pos.z, pos.x);
        highp float distCyl = length(pos.xz)-0.25;
        distCyl -= 1.0/16.0-(pos.y/8.0)*(pos.y/8.0);
        // highp float a = ((mod(12.0*theta/3.14159+0.5,1.0))-0.5);
        // distCyl -= 0.05*a*a;
        return max(max(distTop, distBottom), distCyl);
}

void main() {
  highp vec3 ray = unnormalized_ray;
  // if (length(unnormalized_ray.xy) > 1.) {
  //   ray.xy = normalize(unnormalized_ray.xy);
  // }
  // ray.z = -cos(M_PI / 2. * length(ray.xy));
  ray = normalize(ray);
  // if (length(unnormalized_ray.xy) > 1.) {
  //   gl_FragColor = VectorToColor(rotateY(ray, translate.y));
  //   return;
  // }
  highp vec3 position = vec3(0.);// + vec3(0., 1., 2.);// + translate;

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

  highp float intensity = clamp(dot(rotate(normal, translate), kLightDirection), 0., 1.);

  highp vec4 ray_color = VectorToColor(rotate(ray, translate)),
      normal_color = VectorToColor(rotate(normal, translate));

  gl_FragColor = mix(ray_color, vec4(normal_color.xyz * intensity, 1.), hit);
}

float DistanceTo(vec3 position) {
  position = rotate(position, translate) + vec3(0., 1., 2.);
  const highp float repeat = 4.;
  highp vec3 q = position;
  q.xz = mod(q.xz, repeat) - 0.5 * repeat;
  highp float wiggle = 0.8 * sin(position.x) + sin(position.z);
  highp float zone = 20.;
  highp vec3 ball_position = hidden * vec3(zone, 0., zone);
  highp float ball_wiggle = 0.8 * sin(hidden.x) * sin(hidden.y);
  return min(
    DistanceToSphere(position + ball_position + vec3(0., -20. * ball_wiggle, 0.)),
    min(
      dot(position, vec3(0., 1., 0.)) + 1. + wiggle,
      column(q)));
  // const highp float d = 50.;
  // return max(
  //   max(
  //     max(
  //       DistanceToPlane(position, vec4(1, 0, 0, d)),
  //       DistanceToPlane(position, vec4(0, 1, 0, d))),
  //     max(
  //       DistanceToPlane(position, vec4(-1, 0, 0, d)),
  //       DistanceToPlane(position, vec4(0, -1, 0, d)))),
  //   DistanceToSpheres(position));
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
