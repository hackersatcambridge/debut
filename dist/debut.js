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
// Reminder: All external dependencies are globals
var $ = jQuery;
console.log($);

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
  this.$.innerContainer = $('<div class="debut-container-inner">');
  this.$.innerContainer.css({ width: this.options.baseWidth, height: this.options.baseWidth / this.options.aspect });
  this.elements.innerContainer = this.$.innerContainer[0];
  this.$.container.append(this.$.innerContainer);

  this.bounds = {};

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

Debut.defaultOptions = {
  full: true,
  fullscreen: false,
  aspect: 16 / 9,
  baseWidth: 1600
};

exports['default'] = Debut;
module.exports = exports['default'];

},{}],2:[function(require,module,exports){
// The __debut variable is defined in the context of the whole module definition
// Which allows it to export the debut object
'use strict';

__debut = require('./debut'); // jshint ignore:line

},{"./debut":1}]},{},[2]);

return __debut;
}));
