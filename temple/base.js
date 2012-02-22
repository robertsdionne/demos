// Copyright 2011 Robert Scott Dionne. All Rights Reserved.

/**
 * @fileoverview
 * @author robertsdionne@gmail.com (Robert Scott Dionne)
 */

var ray = {};
var webgl = {};


ray.global = this;


ray.inherits = function(child, parent) {
  var temp = function() {};
  temp.prototype = parent.prototype;
  child.superClass_ = parent.prototype;
  child.prototype = new temp();
  child.prototype.constructor = child;
};


ray.bind = function(fn, self) {
  var context = self || ray.global;
  if (arguments > 2) {
    var bound = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(arguments, bound);
      return fn.apply(context, newArgs);
    };
  } else {
    return function() {
      return fn.apply(context, arguments);
    }
  }
};


ray.nullFunction = function() {};


ray.abstractMethod = function() {
  throw new Error('Unimplemented abstract method.');
};


var srcs = [
  'keys.js',
  'ray.js'
];
srcs.forEach(function(src) {
  document.write(
      '<script type="application/javascript" src="' +
      src + '"></' + 'script>');
});
