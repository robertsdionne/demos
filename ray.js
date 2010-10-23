// Copyright 2010 Robert Scott Dionne. All Rights Reserved.

goog.provide('astoroids');

goog.require('astoroids.Key');
goog.require('astoroids.Keys');
goog.require('astoroids.Sound');
goog.require('astoroids.Thing');
goog.require('astoroids.updateAsteroid');
goog.require('astoroids.updateBullet');
goog.require('astoroids.updateShip');


var big = [
  [-0.05924, -0.03620,
   -0.05924,  0.02010,
   -0.03514,  0.07640,
    0.00301,  0.05764,
    0.02711,  0.07909,
    0.05120,  0.03887,
    0.00301,  0.00402,
    0.05321, -0.02011,
    0.05321, -0.03620,
    0.01104, -0.07373,
   -0.03113, -0.07373,
   -0.01707, -0.03620 ],

  [-0.05723, -0.03378,
   -0.05723,  0.04933,
   -0.03514,  0.08150,
    0.01305,  0.08150,
    0.05321,  0.04129,
    0.03715, -0.00161,
    0.05321, -0.04182,
    0.02711, -0.06863,
   -0.00301, -0.03914,
   -0.03113, -0.06863 ],

  [-0.05111, -0.02242,
   -0.02300, -0.00901,
   -0.05111,  0.01243,
   -0.02902,  0.06873,
   -0.00091,  0.00171,
   -0.00894,  0.06873,
    0.01917,  0.06873,
    0.06134,  0.00171,
    0.06134, -0.02778,
    0.03323, -0.08140,
   -0.01095, -0.08140 ],

  [-0.05238, -0.03262,
   -0.03832,  0.00224,
   -0.05238,  0.04245,
   -0.02427,  0.07730,
   -0.01222,  0.05854,
    0.02393,  0.07730,
    0.05806,  0.02100,
    0.02593, -0.01653,
    0.05806, -0.03262,
    0.02995, -0.07283,
    0.00184, -0.05138,
   -0.01824, -0.07283 ]
];

var subdivideLoop = function(k, points) {
  var out = [];
  var m = points.length;
  for (var i = 0; i < m; i += 2) {
    var x0 = 1.33512 * points[i % m];
    var y0 =  points[(i+1) % m];
    var x1 = 1.33512 * points[(i+2) % m];
    var y1 = points[(i+3) % m];
    for (var j = 0; j < k; ++j) {
      out.push(x0 + j * (x1 - x0) / k);
      out.push(y0 + j * (y1 - y0) / k);
    }
  }
  return out;
};


var keys = new astoroids.Keys();


astoroids.load = function() {
  var canvas = document.getElementById('c');
  keys.install(window);
  canvas.width = 640;
  canvas.height = 640;
  var gl = canvas.getContext('experimental-webgl');
  var p = gl.createProgram();
  var b = gl.createBuffer();
  var g = gl.createBuffer();
  var asteroidBuffer = gl.createBuffer();
  onCreate(gl, p, b, g, asteroidBuffer);
  var width, height;
  window.setInterval(function() {
    if (width !== canvas.width || height !== canvas.height) {
      width = canvas.width;
      height = canvas.height;
      onChange(gl, width, height);
    }
    update();
    onDraw(gl, p, b, g, asteroidBuffer);
  }, 10);
};

var ship = new astoroids.Thing();
var bullets = [];
var asteroids = [];
for (var i = 0; i < 3; ++i) {
  var asteroid = new astoroids.Thing(
    Math.random(), Math.random(),
    (Math.random() - 0.5) / 250.0, (Math.random() - 0.5) / 250.0,
    0.0, 0.14);
  asteroids.push(asteroid);
}

var pi = 3.141592653589793;

var boom = new astoroids.Sound('boom', 10);
var shoot = new astoroids.Sound('shoot', 10);
var thrust = new astoroids.Sound('thrust');

var update = function() {
  if (keys.justDown(astoroids.Key.FIRE)) {
    shoot.play();
    var bullet = new astoroids.Thing(
        ship.x,
        ship.y,
        ship.xv + 0.005 * Math.cos(2.0 * pi * ship.heading),
        ship.yv + 0.005 * Math.sin(2.0 * pi * ship.heading));
    ship.xv -= 0.0005 * Math.cos(2.0 * pi * ship.heading);
    ship.yv -= 0.0005 * Math.sin(2.0 * pi * ship.heading);
    bullets.push(bullet);
    if (bullets.length > 10) {
      bullets.shift();
    }
  }
  if (keys.isDown(astoroids.Key.UP)) {
    if (keys.justDown(astoroids.Key.UP)) {
      thrust.play();
    }
    ship.xv += 0.00008 * Math.cos(2.0 * pi * ship.heading);
    ship.yv += 0.00008 * Math.sin(2.0 * pi * ship.heading);
  }
  if (keys.isDown(astoroids.Key.LEFT)) {
    ship.heading -= 0.01;
  }
  if (keys.isDown(astoroids.Key.RIGHT)) {
    ship.heading += 0.01;
  }
  var newAsteroids = [];
  for (var i = 0; i < asteroids.length; ++i) {
    for (var j = 0; j < bullets.length; ++j) {
      if (asteroids[i] && bullets[j] && asteroids[i].collide(bullets[j])) {
        var dx = asteroids[i].xv - bullets[j].xv;
        var dy = asteroids[i].yv - bullets[j].yv;
        var p = dx * dx + dy * dy;
        boom.play(Math.min(1.0, Math.sqrt(1000 * p)));
        asteroids[i].xv += bullets[j].xv * 0.01;
        asteroids[i].yv += bullets[j].yv * 0.01;
        delete bullets[j];
      }
    }
  }
  asteroids = asteroids.concat(newAsteroids);
  for (var i = 0; i < asteroids.length; ++i) {
    if (asteroids[i]) {
      asteroids[i].update(astoroids.updateAsteroid);
    }
  }
  for (var i = 0; i < bullets.length; ++i) {
    if (bullets[i]) {
      bullets[i].update(astoroids.updateBullet);
    }
  }
  ship.update(astoroids.updateShip);
  keys.update();
};

var N = 23;
var M = 8000;

var onCreate = function(gl, p, b, g, asteroid) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
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

  p.size = gl.getUniformLocation(p, 'size');
  p.xyChi = gl.getUniformLocation(p, 'xyChi');
  p.abRho = gl.getUniformLocation(p, 'abRho');
  p.position = gl.getAttribLocation(p, 'position');
  p.wrap = gl.getUniformLocation(p, 'wrap');

  var data = [];
  for (var i = 0; i < 10; ++i) {
    data.push(-0.03217 + i * 2.0 * 0.03217 / 10.0);
    data.push(-0.01406 + i * 0.01406 / 10.0);
  }
  for (var i = 0; i < 11; ++i) {
    data.push(0.03217 + i * -2.0 * 0.03217 / 10.0);
    data.push(i * 0.01406 / 10.0);
  }
  data.push(data[36], data[37]);
  data.push(data[4], data[5]);

  var a = new Float32Array(data);
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, a.byteLength, gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, a);

  var data2 = [0.0, 0.0];
  for (var i = 0; i < M; ++i) {
    data2.push(Math.random(), Math.random());
  }

  var d = new Float32Array(data2);
  gl.bindBuffer(gl.ARRAY_BUFFER, g);
  gl.bufferData(gl.ARRAY_BUFFER, d.byteLength, gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, d);

  var asteroidBuffer = new Float32Array(subdivideLoop(10, big[0]));
  gl.bindBuffer(gl.ARRAY_BUFFER, asteroid);
  gl.bufferData(gl.ARRAY_BUFFER, asteroidBuffer.byteLength, gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, asteroidBuffer);
};


var onChange = function(gl, width, height) {
  gl.viewport(0, 0, width, height);
};

var abRho = new Float32Array([0.32, 0.44, 0.125]);

var wrap = function(coord) {
  return coord - Math.floor(coord);
};

var onDraw = function(gl, p, b, g, asteroidBuffer) {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  var xyChi = new Float32Array([wrap(ship.x), wrap(ship.y), ship.heading]);
  gl.uniform1i(p.wrap, false);
  gl.uniform3fv(p.xyChi, xyChi);
  gl.uniform3fv(p.abRho, abRho);
  gl.vertexAttribPointer(p.position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(p.position);
  gl.drawArrays(gl.LINE_STRIP, 0, N);
  gl.disableVertexAttribArray(p.position);

  gl.bindBuffer(gl.ARRAY_BUFFER, g);
  var xyChi = new Float32Array([-0.02 * ship.x, -0.02 * ship.y, 0.0]);
  gl.uniform1i(p.wrap, true);
  gl.uniform1f(p.size, 0.7);
  gl.uniform3fv(p.xyChi, xyChi);
  gl.uniform3fv(p.abRho, abRho);
  gl.vertexAttribPointer(p.position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(p.position);
  gl.drawArrays(gl.POINTS, 0, M);
  gl.disableVertexAttribArray(p.position);

  for (var i = 0; i < bullets.length; ++i) {
    if (bullets[i]) {
      gl.bindBuffer(gl.ARRAY_BUFFER, g);
      var xyChi =
          new Float32Array([wrap(bullets[i].x), wrap(bullets[i].y), 0.0]);
      gl.uniform1i(p.wrap, false);
      gl.uniform1f(p.size, 2.5);
      gl.uniform3fv(p.xyChi, xyChi);
      gl.uniform3fv(p.abRho, abRho);
      gl.vertexAttribPointer(p.position, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(p.position);
      gl.drawArrays(gl.POINTS, 0, 1);
      gl.disableVertexAttribArray(p.position);
    }
  }

  for (var i = 0; i < asteroids.length; ++i) {
    if (asteroids[i]) {
      gl.bindBuffer(gl.ARRAY_BUFFER, asteroidBuffer);
      var xyChi =
          new Float32Array([wrap(asteroids[i].x), wrap(asteroids[i].y), 0.0]);
      gl.uniform1i(p.wrap, false);
      gl.uniform1f(p.size, 1.0);
      gl.uniform3fv(p.xyChi, xyChi);
      gl.uniform3fv(p.abRho, abRho);
      gl.vertexAttribPointer(p.position, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(p.position);
      gl.drawArrays(gl.LINE_LOOP, 0, 120);
      gl.disableVertexAttribArray(p.position);
    }
  }
  gl.flush();
};
