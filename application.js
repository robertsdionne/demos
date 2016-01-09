'use strict';


demos.Application = class {

  constructor({window, document, canvas, gl}) {
    this.window = window;
    this.document = document;
    this.canvas = canvas;
    this.gl = gl;
    this.program0 = this.gl.createProgram();
    this.program1 = this.gl.createProgram();
    this.buffer = this.gl.createBuffer();
  }

  run() {
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

    this.program0.translate = this.gl.getUniformLocation(this.program0, 'translate');
    this.program0.position = this.gl.getAttribLocation(this.program0, 'position');

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

  compileAndAttachShader(program, shaderId, shaderType) {
    var shader = this.gl.createShader(shaderType);
    this.gl.shaderSource(shader, this.getShaderSource(shaderId));
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error(this.gl.getShaderInfoLog(shader));
    }
    this.gl.attachShader(program, shader);
    this.gl.deleteShader(shader);
  }

  getShaderSource(shaderId) {
    var request = new XMLHttpRequest();
    request.open('GET', shaderId, false);
    request.send(null);
    return request.responseText;
  }

  render() {
    this.gl.viewport(0, 0, demos.WIDTH / 2, demos.HEIGHT);

    this.gl.clearColor(0, 0, 0, 1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    var t = this.window.performance.now() / 1000.0 / 10.0;

    this.gl.useProgram(this.program0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.uniform3f(this.program0.translate, 8 * Math.cos(10 * t), 2 * Math.sin(t), Math.tan(t));
    this.gl.vertexAttribPointer(this.program0.position, 3, this.gl.FLOAT, false, 12, 0);
    this.gl.enableVertexAttribArray(this.program0.position);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    this.gl.disableVertexAttribArray(this.program0.position);

    this.gl.viewport(demos.WIDTH / 2, 0, demos.WIDTH / 2, demos.HEIGHT);

    this.gl.useProgram(this.program1);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.uniform3f(this.program1.translate, 8 * Math.cos(10 * t), 2 * Math.sin(t), Math.tan(t));
    this.gl.vertexAttribPointer(this.program1.position, 3, this.gl.FLOAT, false, 12, 0);
    this.gl.enableVertexAttribArray(this.program1.position);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    this.gl.disableVertexAttribArray(this.program1.position);

    this.gl.flush();

    this.window.requestAnimationFrame(() => {
          this.render();
        });
  }
};
