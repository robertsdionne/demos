'use strict';

var demos = {};


demos.Events = {
  LOAD: 'load',
};


demos.CANVAS_ID = 'c';


demos.FRAGMENT_SHADER0_ID = 'fragment-shader-0.glsl';
demos.FRAGMENT_SHADER1_ID = 'fragment-shader-2.glsl';


demos.HEIGHT = 224;
demos.WIDTH = 2 * demos.HEIGHT;


demos.VERTEX_SHADER_ID = 'vertex-shader-0.glsl';


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
