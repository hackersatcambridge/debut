/* jshint ignore: start */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.Debut = factory(root.jQuery);
  }
}(this, function(jQuery) {
var __debut;
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Reminder: All external dependencies are globals
var $ = jQuery;

var Debut = function Debut() {};

exports["default"] = Debut;
module.exports = exports["default"];

},{}],2:[function(require,module,exports){
// The __debut variable is defined in the context of the whole module definition
// Which allows it to export the debut object
'use strict';

__debut = require('./debut'); // jshint ignore:line

},{"./debut":1}]},{},[2]);

return __debut;
}));
