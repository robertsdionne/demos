// Copyright 2011 ... All Rights Reserved.

/**
 * @param {Document} document
 * @constructor
 */
ray.Keys = function(document) {
  /**
   * @type {Document}
   */
  this.document_ = document;

  /**
   * @type {Object}
   */
  this.keys_ = {};

  /**
   * @type {Object}
   */
  this.oldKeys_ = {};
};


ray.Key = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  Q: 81,
  Y: 89,
  Z: 90,
  N: 78,
  P: 80,
  LT: 188,
  GT: 190
};


/**
 *
 */
ray.Keys.prototype.install = function() {
  this.document_.onkeydown = ray.bind(this.handleKeyDown_, this);
  this.document_.onkeyup = ray.bind(this.handleKeyUp_, this);
};


ray.Keys.prototype.uninstall = function() {
  this.document_.onkeydown = this.document_.onkeyup = null;
};


ray.Keys.prototype.handleKeyDown_ = function(event) {
  this.keys_[event.keyCode] = true;
  return true;
};


ray.Keys.prototype.handleKeyUp_ = function(event) {
  this.keys_[event.keyCode] = false;
  return true;
};


ray.Keys.prototype.isHeld = function(key) {
  return this.isPressed(key) && this.oldKeys_[key];
};


ray.Keys.prototype.isPressed = function(key) {
  return this.keys_[key];
};


ray.Keys.prototype.justPressed = function(key) {
  return this.isPressed(key) && !this.oldKeys_[key];
};


ray.Keys.prototype.justReleased = function(key) {
  return !this.isPressed(key) && this.oldKeys_[key];
};


ray.Keys.prototype.update = function() {
  for (var key in this.keys_) {
    this.oldKeys_[key] = this.keys_[key];
  }
};
