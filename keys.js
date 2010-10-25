// Copyright 2010.

goog.provide('ray.Key');
goog.provide('ray.Keys');

goog.require('goog.events');
goog.require('goog.events.KeyHandler');


ray.Key = {
  FIRE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
};


ray.Keys = function() {
  this.keys_ = [];
  this.oldKeys_ = [];
  this.element_;
  this.handler_ = new goog.events.KeyHandler();
};


ray.Keys.prototype.install = function(element) {
  this.element_ = element;
  this.handler_.attach(element);
  goog.events.listen(
      this.handler_, 'key', goog.bind(this.onKeyDown_, this));
  goog.events.listen(
      this.element_, 'keyup', goog.bind(this.onKeyUp_, this));
};


ray.Keys.prototype.isDown = function(key) {
  return this.keys_[key];
};


ray.Keys.prototype.isUp = function(key) {
  return !this.keys_[key];
};


ray.Keys.prototype.justDown = function(key) {
  return this.keys_[key] && !this.oldKeys_[key];
};


ray.Keys.prototype.justUp = function(key) {
  return !this.keys_[key] && this.oldKeys_[key];
};


ray.Keys.prototype.onKeyDown_ = function(e) {
  this.keys_[e.keyCode] = true;
};


ray.Keys.prototype.onKeyUp_ = function(e) {
  this.keys_[e.keyCode] = false;
};


ray.Keys.prototype.update = function() {
  this.oldKeys_ = this.keys_.slice();
};


ray.Keys.prototype.uninstall = function() {
  goog.events.removeAll(this.element_);
  this.handler_.detach();
  this.element_ = null;
};
