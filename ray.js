// Copyright 2010 Robert Scott Dionne. All Rights Reserved.

var keys = new ray.Keys(document);


ray.load = function() {
  var canvas = document.getElementById('c');
  keys.install();
  canvas.width = 640;
  canvas.height = 640;
  var gl = canvas.getContext('experimental-webgl');
  var p = gl.createProgram();
  var b = gl.createBuffer();
  onCreate(gl, p, b);
  var width, height;
  window.setInterval(function() {
    if (width !== canvas.width || height !== canvas.height) {
      width = canvas.width;
      height = canvas.height;
      onChange(gl, width, height);
    }
    update();
    onDraw(gl, p, b);
  }, 10);
};


var X = 0;
var Y = 0;
var Z = -5;
var debug = false;
var distanceFn = 0;


var update = function() {
  if (keys.isPressed(ray.Key.W)) {
    Y += 0.1;
  }
  if (keys.isPressed(ray.Key.S)) {
    Y -= 0.1;
  }
  if (keys.isPressed(ray.Key.A)) {
    X -= 0.1;
  }
  if (keys.isPressed(ray.Key.D)) {
    X += 0.1;
  }
  if (keys.isPressed(ray.Key.Z)) {
    Z += 0.1;
  }
  if (keys.isPressed(ray.Key.Q)) {
    Z -= 0.1;
  }
  if (keys.justPressed(ray.Key.Y)) {
    debug = !debug;
  }
  if (keys.justPressed(ray.Key.N)) {
    if (distanceFn < 6) {
      ++distanceFn;
    } else {
      distanceFn = 0;
    }
  }
  if (keys.justPressed(ray.Key.P)) {
    if (distanceFn > 0) {
      --distanceFn;
    } else {
      distanceFn = 6;
    }
  }
  keys.update();
};

var onCreate = function(gl, p, b) {
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  var v = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(v, document.getElementById('v').text);
  var result = gl.compileShader(v);
  gl.compileShader(v);
  if (!gl.getShaderParameter(v, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(v));
  }
  gl.attachShader(p, v);
  gl.deleteShader(v); v = null;
  var f = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(f, document.getElementById('f').text);
  gl.compileShader(f);
  if (!gl.getShaderParameter(f, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(f));
  }
  gl.attachShader(p, f);
  gl.deleteShader(f); f = null;
  gl.linkProgram(p);
  gl.useProgram(p);

  p.position = gl.getAttribLocation(p, 'position');

  p.translate = gl.getUniformLocation(p, 'translate');
  p.debug = gl.getUniformLocation(p, 'debug');
  p.distanceFn = gl.getUniformLocation(p, 'distanceFn');

  var data = [
    1.0, -1.0,  -1.0,
    1.0,  1.0,  -1.0,
   -1.0, -1.0,  -1.0,
   -1.0, -1.0,  -1.0,
    1.0,  1.0,  -1.0,
   -1.0,  1.0,  -1.0,

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


var onDraw = function(gl, p, b) {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  gl.uniform3fv(p.translate, new Float32Array([X, Y, Z]));
  gl.uniform1i(p.debug, debug);
  gl.uniform1i(p.distanceFn, distanceFn);
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.vertexAttribPointer(p.position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(p.position);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(p.position);

  gl.flush();
};
