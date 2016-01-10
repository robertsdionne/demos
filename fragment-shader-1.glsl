precision mediump float;

uniform highp vec3 translate;

varying highp vec3 unnormalized_ray;

float DistanceTo(vec3 position);
float DistanceToSpheres(vec3 position);
float DistanceToSphere(vec3 position);
float DistanceToPlane(vec3 position, vec4 normal);
vec4 VectorToColor(vec3 vector);

#define M_PI 3.14159265358979323846264338327950288

const highp float kEpsilon = 1.e-3;
const highp vec3 kLightDirection = normalize(vec3(1., 1., 1.));

highp vec3 rotateY(highp vec3 pos, highp float a) {
        highp mat3 r = mat3(1);
        r[0][0] = cos(a);
        r[2][0] = sin(a);
        r[0][2] = -sin(a);
        r[2][2] = cos(a);
        return r * pos;
      }

float column(vec3 pos) {
  pos.y -= .5;
        highp float distTop = dot(pos, vec3(0.0, 1.0, 0.0))-2.0;
        highp float distBottom = dot(pos, vec3(0.0, -1.0, 0.0))-2.0;
        highp float theta = atan(pos.z, pos.x);
        highp float distCyl = length(pos.xz)-0.25;
        distCyl -= 1.0/16.0-(pos.y/8.0)*(pos.y/8.0);
        highp float a = ((mod(12.0*theta/3.14159+0.5,1.0))-0.5);
        distCyl -= 0.05*a*a;
        return max(max(distTop, distBottom), distCyl);
}

void main() {
  highp vec3 ray = unnormalized_ray;
//      ray.xy *= vec2(M_PI / 2.);
//      highp float theta = 2. * acos(cos(ray.x / 2.) * cos(ray.y / 2.));
//      ray.xy = -normalize(ray.xy) * log(cos(theta));
  ray = normalize(ray);
  highp vec3 position = vec3(0.) + vec3(0., 1., 2.);// + translate;

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

  highp vec4 ray_color = VectorToColor(rotateY(ray, translate.y)),
      normal_color = VectorToColor(rotateY(normal, translate.y));

  gl_FragColor = mix(ray_color, vec4(normal_color.xyz * intensity, 1.), hit);
}

float DistanceTo(vec3 position) {
  position = rotateY(position, translate.y);
  const highp float repeat = 2.;
  highp vec3 q = position;
  q.xz = mod(q.xz, repeat) - 0.5 * repeat;
  return column(q);
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
