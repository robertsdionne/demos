'use strict';

var demos = {};


demos.Events = {
  LOAD: 'load',
};


demos.CANVAS_ID = 'c';


demos.HEIGHT = demos.WIDTH = 640;


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
  }

  run() {
    this.canvas.width = demos.WIDTH;
    this.canvas.height = demos.HEIGHT;

    this.gl.viewport(0, 0, demos.WIDTH, demos.HEIGHT);

    this.render();
  }

  render() {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.window.requestAnimationFrame(() => {
          this.render();
        });
  }
};
