// Copyright 2010 Robert Scott Dionne. All Rights Reserved.

var keys = new ray.Keys(document);

ray.load = function() {
  var canvas = document.getElementById('c');
  canvas.width = 640;
  canvas.height = 640;
  var gl = canvas.getContext('experimental-webgl');
  var p = gl.createProgram();
  var q = gl.createProgram();
  var q2 = gl.createProgram();
  var b = gl.createBuffer();
  var t = gl.createTexture();
  var f = gl.createFramebuffer();
  var width, height;
  keys.install();
  onCreate(gl, p, q, q2, t, f, b);
  window.setTimeout(function draw() {
    if (width !== canvas.width || height !== canvas.height) {
      width = canvas.width;
      height = canvas.height;
      onChange(gl, width, height);
    }
    update();
    onDraw(gl, p, q, q2, t, f, b);
    window.setTimeout(draw, 1000/60);
  }, 1000/60);
};

var MAX_FN_INDEX = 8;

var dS = 0.05;
var X = 0;
var Y = 0;
var Z = -4;
var prevTick = +new Date();
var T = 0;
var debug = false;
var eyeTrackingLod = false;
var intersector = false;
var distanceFn = 0;


var update = function() {
  var tick = +new Date();
  T += (tick - prevTick) / 1000;
  prevTick = tick;
  if (keys.isPressed(ray.Key.W)) {
    Y += dS;
  }
  if (keys.isPressed(ray.Key.S)) {
    Y -= dS;
  }
  if (keys.isPressed(ray.Key.A)) {
    X -= dS;
  }
  if (keys.isPressed(ray.Key.D)) {
    X += dS;
  }
  if (keys.isPressed(ray.Key.Z)) {
    Z += dS;
  }
  if (keys.isPressed(ray.Key.Q)) {
    Z -= dS;
  }
  if (keys.justPressed(ray.Key.Y)) {
    debug = !debug;
  }
  if (keys.justPressed(ray.Key.U)) {
    eyeTrackingLod = !eyeTrackingLod;
  }
  if (keys.justPressed(ray.Key.I)) {
    intersector = !intersector;
  }
  if (keys.justPressed(ray.Key.N)) {
    if (distanceFn < MAX_FN_INDEX) {
      ++distanceFn;
    } else {
      distanceFn = 0;
    }
  }
  if (keys.justPressed(ray.Key.P)) {
    if (distanceFn > 0) {
      --distanceFn;
    } else {
      distanceFn = MAX_FN_INDEX;
    }
  }
  keys.update();
};


var compileProgram = function(gl, p, vid, fid) {
  var v = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(v, document.getElementById(vid).text);
  gl.compileShader(v);
  if (!gl.getShaderParameter(v, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(v));
  }
  gl.attachShader(p, v);
  gl.deleteShader(v); v = null;
  var f = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(f, document.getElementById(fid).text);
  gl.compileShader(f);
  if (!gl.getShaderParameter(f, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(f));
  }
  gl.attachShader(p, f);
  gl.deleteShader(f); f = null;
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p));
  }
};

var onCreate = function(gl, p, q, q2, t, f, b) {
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  compileProgram(gl, p, 'v0', 'f0');
  compileProgram(gl, q, 'v1', 'f1');
  compileProgram(gl, q2, 'v1', 'f2');

  p.position = gl.getAttribLocation(p, 'position');

  p.translate = gl.getUniformLocation(p, 'translate');
  p.debug = gl.getUniformLocation(p, 'debug');
  p.eyeTrackingLod = gl.getUniformLocation(p, 'eyeTrackingLod');
  p.distanceFn = gl.getUniformLocation(p, 'distanceFn');
  p.t = gl.getUniformLocation(p, 't');

  q.uProject = gl.getUniformLocation(q, 'uProject');
  q.uTransform = gl.getUniformLocation(q, 'uTransform');

  q.aPosition = gl.getAttribLocation(q, 'aPosition');
  q.aNormal = gl.getAttribLocation(q, 'aNormal');

  q2.uProject = gl.getUniformLocation(q2, 'uProject');
  q2.uTransform = gl.getUniformLocation(q2, 'uTransform');

  q2.aPosition = gl.getAttribLocation(q2, 'aPosition');
  q2.aNormal = gl.getAttribLocation(q2, 'aNormal');

  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 640, 640, 0, gl.RGBA,
      gl.UNSIGNED_BYTE, null);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  var error = gl.getError();
  if (error != gl.NO_ERROR) {
    console.log(error);
  }

  var r = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, r);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 640, 640);

  gl.bindFramebuffer(gl.FRAMEBUFFER, f);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
      t, 0);
  gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, r);

  var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status != gl.FRAMEBUFFER_COMPLETE) {
    console.log(status);
  }

  var data = [
    1.0, -1.0, -1.0,
    0.0,  0.0,  1.0,
    1.0,  1.0, -1.0,
    0.0,  0.0,  1.0,
   -1.0, -1.0, -1.0,
    0.0,  0.0,  1.0,
   -1.0, -1.0, -1.0,
    0.0,  0.0,  1.0,
    1.0,  1.0, -1.0,
    0.0,  0.0,  1.0,
   -1.0,  1.0, -1.0,
    0.0,  0.0,  1.0

//  1.0, -1.0,  1.0,
//  1.0,  1.0,  1.0,
// -1.0, -1.0,  1.0,
// -1.0, -1.0,  1.0,
//  1.0,  1.0,  1.0,
// -1.0,  1.0,  1.0,
// -1.0, -1.0,  1.0,
// -1.0,  1.0,  1.0,
// -1.0, -1.0, -1.0,
// -1.0, -1.0, -1.0,
// -1.0,  1.0,  1.0,
// -1.0,  1.0, -1.0,
//  1.0,  1.0,  1.0,
//  1.0, -1.0,  1.0,
//  1.0, -1.0, -1.0,
//  1.0,  1.0,  1.0,
//  1.0, -1.0, -1.0,
//  1.0,  1.0, -1.0,
//  -1.0, 1.0, 1.0,
//  1.0, 1.0, 1.0,
//  1.0, 1.0, -1.0,
//  -1.0, 1.0, 1.0,
//  1.0, 1.0, -1.0,
//  -1.0, 1.0, -1.0,
//  1.0, -1.0, 1.0,
//  -1.0, -1.0, 1.0,
//  1.0, -1.0, -1.0,
//  1.0, -1.0, -1.0,
//  -1.0, -1.0, 1.0,
//  -1.0, -1.0, -1.0,
//  1.0,  1.0,  -1.0,
//  1.0, -1.0,  -1.0,
// -1.0, -1.0,  -1.0,
//  1.0,  1.0,  -1.0,
// -1.0, -1.0,  -1.0,
// -1.0,  1.0,  -1.0
  ];

  var a = new Float32Array(data);
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, a.byteLength, gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, a);
};


var onChange = function(gl, width, height) {
  gl.viewport(0, 0, width, height);
};


var getPerspectiveProjectionMatrix = function() {
  return [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, -1001.0/999.0, -1.0,
    0.0, 0.0, -2000.0/999.0, 0.0
  ];
};


var getTransform = function() {
  return [
    1.0, 0.0, 0.0, 0.0,
    0.0, Math.cos(Math.PI/4), -Math.sin(Math.PI/4), 0.0,
    0.0, Math.sin(Math.PI/4), Math.cos(Math.PI/4), 0.0,
    0.0, 0.0, -2.0, 1.0
  ];
};


var getIdentity = function() {
  return [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  ];
};


var onDraw = function(gl, p, q, q2, t, f, b) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, f);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  if (intersector) {
    gl.useProgram(q2);
    gl.uniformMatrix4fv(q2.uProject, false, getPerspectiveProjectionMatrix());
    gl.uniformMatrix4fv(q2.uTransform, false, getTransform());
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.vertexAttribPointer(q2.aPosition, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(q2.aNormal, 3, gl.FLOAT, false, 24, 12);
    gl.enableVertexAttribArray(q2.aPosition);
    gl.enableVertexAttribArray(q2.aNormal);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(q2.aPosition);
    gl.disableVertexAttribArray(q2.aNormal);
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0.125, 0.125, 0.125, 1.0);
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  if (intersector) {
    gl.useProgram(q);
    gl.uniformMatrix4fv(q.uProject, false, getPerspectiveProjectionMatrix());
    gl.uniformMatrix4fv(q.uTransform, false, getTransform());
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.vertexAttribPointer(q.aPosition, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(q.aNormal, 3, gl.FLOAT, false, 24, 12);
    gl.enableVertexAttribArray(q.aPosition);
    gl.enableVertexAttribArray(q.aNormal);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(q.aPosition);
    gl.disableVertexAttribArray(q.aNormal);
  }

  gl.useProgram(p);
  gl.uniform3fv(p.translate, new Float32Array([X, Y, Z]));
  gl.uniform1i(p.debug, debug);
  gl.uniform1i(p.eyeTrackingLod, eyeTrackingLod);
  gl.uniform1i(p.distanceFn, distanceFn);
  gl.uniform1f(p.t, T);
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.vertexAttribPointer(p.position, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(p.position);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(p.position);

  gl.flush();
};
