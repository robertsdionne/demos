(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var demos = {};

demos.Events = {
  LOAD: 'load'
};

demos.CANVAS_ID = 'c';

demos.FRAGMENT_SHADER0_ID = 'fragment-shader-0.glsl';
demos.FRAGMENT_SHADER1_ID = 'fragment-shader-2.glsl';

demos.HEIGHT = 224;
demos.WIDTH = 2 * demos.HEIGHT;

demos.VERTEX_SHADER_ID = 'vertex-shader-0.glsl';

demos.WEBGL = 'webgl';

window.addEventListener(demos.Events.LOAD, function () {
  var canvas = document.getElementById(demos.CANVAS_ID);
  new demos.Application({
    window: window,
    document: document,
    canvas: canvas,
    gl: canvas.getContext(demos.WEBGL)
  }).run();
});
'use strict';

demos.Application = function () {
  function _class(_ref) {
    var window = _ref.window;
    var document = _ref.document;
    var canvas = _ref.canvas;
    var gl = _ref.gl;

    _classCallCheck(this, _class);

    this.window = window;
    this.document = document;
    this.canvas = canvas;
    this.gl = gl;
    this.program0 = this.gl.createProgram();
    this.program1 = this.gl.createProgram();
    this.program2 = this.gl.createProgram();
    this.buffer = this.gl.createBuffer();
    this.framebuffer = this.gl.createFramebuffer();
    this.texture = this.gl.createTexture();
    this.hidden = [Math.random() * 2. - 1., Math.random() * 2. - 1., Math.random() * 2. - 1.];
    this.frame = 0;
  }

  _createClass(_class, [{
    key: 'run',
    value: function run() {
      this.canvas.width = demos.WIDTH;
      this.canvas.height = demos.HEIGHT;

      this.compileAndAttachShader(this.program0, demos.VERTEX_SHADER_ID, this.gl.VERTEX_SHADER);
      this.compileAndAttachShader(this.program0, demos.FRAGMENT_SHADER0_ID, this.gl.FRAGMENT_SHADER);

      this.gl.linkProgram(this.program0);
      if (!this.gl.getProgramParameter(this.program0, this.gl.LINK_STATUS)) {
        throw new Error(this.gl.getProgramInfoLog(this.program0));
      }

      this.compileAndAttachShader(this.program1, demos.VERTEX_SHADER_ID, this.gl.VERTEX_SHADER);
      this.compileAndAttachShader(this.program1, demos.FRAGMENT_SHADER1_ID, this.gl.FRAGMENT_SHADER);

      this.gl.linkProgram(this.program1);
      if (!this.gl.getProgramParameter(this.program1, this.gl.LINK_STATUS)) {
        throw new Error(this.gl.getProgramInfoLog(this.program1));
      }

      this.compileAndAttachShader(this.program2, demos.VERTEX_SHADER_ID, this.gl.VERTEX_SHADER);
      this.compileAndAttachShader(this.program2, 'fragment-shader-1.glsl', this.gl.FRAGMENT_SHADER);

      this.gl.linkProgram(this.program2);
      if (!this.gl.getProgramParameter(this.program2, this.gl.LINK_STATUS)) {
        throw new Error(this.gl.getProgramInfoLog(this.program2));
      }

      this.program0.translate = this.gl.getUniformLocation(this.program0, 'translate');
      this.program0.hidden = this.gl.getUniformLocation(this.program0, 'hidden');
      this.program0.position = this.gl.getAttribLocation(this.program0, 'position');

      this.program1.sampler = this.gl.getUniformLocation(this.program1, 'sampler');
      this.program1.position = this.gl.getAttribLocation(this.program1, 'position');

      this.program2.translate = this.gl.getUniformLocation(this.program2, 'translate');
      this.program2.hidden = this.gl.getUniformLocation(this.program2, 'hidden');
      this.program2.position = this.gl.getAttribLocation(this.program2, 'position');

      var data = new Float32Array([-1, -1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1]);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);

      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, demos.WIDTH / 2, demos.HEIGHT, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
      this.gl.texParameterf(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameterf(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      var error = this.gl.getError();
      if (this.gl.NO_ERROR != error) {
        throw new Error(error);
      }

      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);

      var status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
      if (this.gl.FRAMEBUFFER_COMPLETE != status) {
        throw new Error(status);
      }

      this.render();
    }
  }, {
    key: 'compileAndAttachShader',
    value: function compileAndAttachShader(program, shaderId, shaderType) {
      var shader = this.gl.createShader(shaderType);
      this.gl.shaderSource(shader, this.getShaderSource(shaderId));
      this.gl.compileShader(shader);
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        throw new Error(this.gl.getShaderInfoLog(shader));
      }
      this.gl.attachShader(program, shader);
      this.gl.deleteShader(shader);
    }
  }, {
    key: 'getShaderSource',
    value: function getShaderSource(shaderId) {
      var request = new XMLHttpRequest();
      request.open('GET', shaderId, false);
      request.send(null);
      return request.responseText;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      this.gl.clearColor(0, 0, 0, 1);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.viewport(0, 0, demos.WIDTH / 2, demos.HEIGHT);

      var t = this.window.performance.now() / 1000.0 / 10.0;
      if (0 == ++this.frame % 10) {
        this.hidden = [Math.random() * 2. - 1., Math.random() * 2. - 1., Math.random() * 2. - 1.];
      }

      _.each([{
        framebuffer: null,
        program: this.program2
      }, {
        framebuffer: this.framebuffer,
        program: this.program0
      }], function (_ref2) {
        var framebuffer = _ref2.framebuffer;
        var program = _ref2.program;

        _this.gl.bindFramebuffer(_this.gl.FRAMEBUFFER, framebuffer);
        _this.gl.clear(_this.gl.COLOR_BUFFER_BIT | _this.gl.DEPTH_BUFFER_BIT);

        _this.gl.useProgram(program);
        _this.gl.bindBuffer(_this.gl.ARRAY_BUFFER, _this.buffer);
        _this.gl.uniform3f(program.translate, 0 * Math.cos(t), 8 * Math.sin(t), Math.tan(t));
        _this.gl.uniform3f(program.hidden, _this.hidden[0], _this.hidden[1], _this.hidden[2]);
        _this.gl.vertexAttribPointer(program.position, 3, _this.gl.FLOAT, false, 12, 0);
        _this.gl.enableVertexAttribArray(program.position);
        _this.gl.drawArrays(_this.gl.TRIANGLE_STRIP, 0, 4);
        _this.gl.disableVertexAttribArray(program.position);
      });

      this.gl.viewport(demos.WIDTH / 2, 0, demos.WIDTH / 2, demos.HEIGHT);

      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.gl.useProgram(this.program1);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.uniform1i(this.program1.sampler, 0);
      this.gl.vertexAttribPointer(this.program1.position, 3, this.gl.FLOAT, false, 12, 0);
      this.gl.enableVertexAttribArray(this.program1.position);
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
      this.gl.disableVertexAttribArray(this.program1.position);

      this.gl.flush();

      this.window.requestAnimationFrame(function () {
        _this.render();
      });
    }
  }]);

  return _class;
}();

},{}]},{},[1]);