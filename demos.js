'use strict';

var demos = {};


demos.Events = {
  LOAD: 'load',
};


demos.CANVAS_ID = 'c';


demos.FRAGMENT_SHADER_ID = 'fragment-shader-0';


demos.HEIGHT = demos.WIDTH = 640;


demos.VERTEX_SHADER_ID = 'vertex-shader-0';


demos.WEBGL = 'webgl';


window.addEventListener(demos.Events.LOAD, () => {
      var canvas = document.getElementById(demos.CANVAS_ID);
      new demos.Application({
            window,
            document,
            canvas,
            gl: canvas.getContext(demos.WEBGL),
          }).run();
    });


demos.Application = class {

  constructor({window, document, canvas, gl}) {
    this.window = window;
    this.document = document;
    this.canvas = canvas;
    this.gl = gl;
    this.program = this.gl.createProgram();
    this.buffer = this.gl.createBuffer();
  }

  run() {
    this.canvas.width = demos.WIDTH;
    this.canvas.height = demos.HEIGHT;

    this.gl.viewport(0, 0, demos.WIDTH, demos.HEIGHT);

    var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertexShader, this.document.getElementById(demos.VERTEX_SHADER_ID).text);
    this.gl.compileShader(vertexShader);
    if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
      throw new Error(this.gl.getShaderInfoLog(vertexShader));
    }
    this.gl.attachShader(this.program, vertexShader);
    this.gl.deleteShader(vertexShader);
    vertexShader = null;

    var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragmentShader, this.document.getElementById(demos.FRAGMENT_SHADER_ID).text);
    this.gl.compileShader(fragmentShader);
    if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
      throw new Error(this.gl.getShaderInfoLog(fragmentShader));
    }
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.deleteShader(fragmentShader);
    fragmentShader = null;

    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw new Error(this.gl.getProgramInfoLog(this.program));
    }

    this.program.position = this.gl.getAttribLocation(this.program, 'position');

    var data = new Float32Array([
          -1, -1, -1,
          1, -1, -1,
          -1, 1, -1,
          1, 1, -1,
        ]);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);

    this.render();
  }

  render() {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.useProgram(this.program);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.vertexAttribPointer(this.program.position, 3, this.gl.FLOAT, false, 12, 0);
    this.gl.enableVertexAttribArray(this.program.position);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    this.gl.disableVertexAttribArray(this.program.position);

    this.gl.flush();

    this.window.requestAnimationFrame(() => {
          this.render();
        });
  }
};
