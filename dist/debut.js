/* jshint ignore: start */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'jquery.transit'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('jquery.transit'));
  } else {
    root.Debut = factory(root.jQuery, root.jQuery.transit);
  }
}(this, function(jQuery, __transit) {
var __debut;
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _animations = require('./animations');

var _animations2 = _interopRequireDefault(_animations);

var $ = jQuery;

/**
 * @constructor
 *
 * The Animation object represents a single animation in the animation queue.
 * It contains all options for a single animation, such as the kind of animation, and the direction it is going in.
 * It is responsible for running an animation, and eventually getting a callback back to the Debut instance
 */
var Animation = function Animation(definition, options) {
  this.options = $.extend(Animation.defaultOptions, definition.defaultOptions || {}, options);
  this.definition = definition;

  this.easing = this.options.easing;
  this.duration = this.options.duration;
  this.delay = this.options.delay;
  this.start = this.options.start;
  this.element = this.options.element;
  this.$element = $(this.element);
  this.direction = this.options.direction;
  this.isJQuery = this.element instanceof $;
  this.isOnDOM = this.element instanceof HTMLElement || this.isJQuery; // Not always true but we will continue
  this.firstRun = true;
  this.store = {};

  if (this.isHidden() && this.direction === 1) {
    this.$element.css('visibility', 'hidden');
  }
};

Animation.prototype.run = function run(context, callback) {
  if (!this.firstRun && !context.reversed && this.definition.beforeState) {
    this.definition.beforeState.call(this, context);
  }

  if (this.definition.prepare) {
    this.definition.prepare.call(this, context);
  }

  if (this.isHidden()) {
    if (context.direction === 1) {
      this.$element.css('visibility', '');
    } else {
      var oldCallback = callback;
      callback = (function callback() {
        this.$element.css('visibility', 'hidden');
        oldCallback();
      }).bind(this);
    }
  }

  this.definition.call(this, context, callback);
};

/**
 * Determine if the animation should toggle the visibility state of the object.
 *
 * @returns {bool} Whether the animation should toggle the visibility state.
 */
Animation.prototype.isHidden = function isHidden() {
  return this.isOnDOM && this.options.entrance;
};

Animation.defaultOptions = {
  easing: 'easeInOutCubic',
  duration: 500,
  delay: 0,
  start: 'step',
  element: null,
  entrance: false,
  direction: 1
};

Animation.animations = _animations2['default'];

exports['default'] = Animation;
module.exports = exports['default'];

},{"./animations":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var $ = jQuery;

var animations = {};

/**
 * The appear animation is the most simple. All it does is make the element appear.
 * The logic is empty because animations naturally handle hiding and showing entrance animations.
 */
animations.appear = function (context, callback) {
  setTimeout(callback.bind(this), this.duration);
};

animations.appear.beforeState = function beforeState(context) {};

animations.appear.defaultOptions = {
  entrance: true,
  duration: 0
};

exports["default"] = animations;
module.exports = exports["default"];

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _animation = require('./animation');

var _animation2 = _interopRequireDefault(_animation);

// Reminder: All external dependencies are globals
var $ = jQuery;

/**
 * The primary Debut object is responsible for handling the presentation.
 */
var Debut = function Debut(element, options) {
  // Store jQuery objects for later reference
  this.$ = {};
  this.elements = {};

  this.options = $.extend({}, Debut.defaultOptions, options);

  this.elements.container = element;
  this.$.container = $(this.elements.container);

  this.$.container.addClass('debut-container');
  this.$.innerContainer = this.$.container.wrapInner('<div class="debut-container-inner">').children();
  this.$.innerContainer.css({ width: this.options.baseWidth, height: this.options.baseWidth / this.options.aspect });
  this.elements.innerContainer = this.$.innerContainer[0];

  this.bounds = {};

  this.animationQueue = [];
  this.animationIndex = 0;

  if (this.options.full) {
    this.$.container.addClass('debut-full');
  }

  this.resize();
  $(window).on('resize', this.resize.bind(this));
};

/**
 * Updates the width and height of the presentation based on the size of its container.
 * Called automatically on window resize. In other cases, you will need to call it yourself
 */
Debut.prototype.resize = function resize(event) {
  this.bounds.width = this.$.innerContainer.width();
  this.bounds.height = this.$.innerContainer.height();
  this.bounds.outerWidth = this.$.container.width();
  this.bounds.outerHeight = this.$.container.height();
  this.bounds.aspect = this.bounds.outerWidth / this.bounds.outerHeight;

  var scale;
  var left;
  var top;

  if (this.bounds.aspect > this.options.aspect) {
    scale = this.bounds.outerHeight / (this.options.baseWidth / this.options.aspect);
    top = 0;
    left = (this.bounds.outerWidth - this.options.baseWidth * scale) / 2;
  } else {
    scale = this.bounds.outerWidth / this.options.baseWidth;
    top = (this.bounds.outerHeight - this.options.baseWidth / this.options.aspect * scale) / 2;
    left = 0;
  }

  this.$.innerContainer.css({ scale: scale, top: top, left: left });
};

/**
 * Adds an animation to the animation queue
 */
Debut.prototype.step = function step(element, animation, options) {
  if (typeof element === 'string') {
    element = $(element)[0];
  }

  animation = Debut.animations[animation];
  animation = new _animation2['default'](animation, $.extend({}, { element: element }, options));

  this.animationQueue.push(animation);

  return this;
};

/**
 * Proceed to the next state of the presentation
 */
Debut.prototype.next = function next() {
  this.proceed(1);
};

/**
 * Proceed to the previous state of the presentation
 */
Debut.prototype.prev = function prev() {
  this.proceed(-1);
};

/**
 * Go forwards or backwards in the presentation state
 */
Debut.prototype.proceed = function proceed(direction) {
  if (direction === -1) {
    this.animationIndex -= 1;
  }

  var animation = this.animationQueue[this.animationIndex];

  if (direction === 1) {
    this.animationIndex += 1;
  }

  var context = {
    debut: this,
    direction: animation.direction * direction,
    reversed: direction === -1
  };

  animation.run(context, function () {});
};

Debut.defaultOptions = {
  full: true,
  fullscreen: false,
  aspect: 16 / 9,
  baseWidth: 1600
};

Debut.Animation = _animation2['default'];
Debut.animations = _animation2['default'].animations;

exports['default'] = Debut;
module.exports = exports['default'];

},{"./animation":1}],4:[function(require,module,exports){
// The __debut variable is defined in the context of the whole module definition
// Which allows it to export the debut object
'use strict';

__debut = require('./debut'); // jshint ignore:line

},{"./debut":3}]},{},[4]);

return __debut;
}));
