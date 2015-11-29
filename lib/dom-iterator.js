
/** @module Debut */
var $ = require('jquery');
/**
 * The `DomIterator` class is runs hooks on DOM elements between two elements
 * in the tree. It runs arbitrary callbacks that can be used for more specific
 * implementations.
 *
 * @param {Object} $container - jQuery object for the containing element
 * @param {Function} callback - Callback fo the form `function (hook, $element)`
 */
var DomIterator = function DomIterator($container, callback) {
  this._hooks = [ ];
  this._$container = $container;
  this._lastDomElement = null;
  this.callback = callback;
};


/**
 * Adds a hooks for selector when iterating through elements
 *
 * @param {String} selector - CSS selector to determine elements
 * @param {Object} hook - Arbitrary handler to be passed when matches are made
 * @param {Object} [options] - Extra options
 */
DomIterator.prototype.addHook = function addHook(selector, hook, options) {
  options = options || { };

  this._hooks.push({
    selector: selector,
    hook: hook,
    options: options
  });

  return this;
};

/**
 * Iterates through the DOM to the element `to`
 */
DomIterator.prototype.iterate = function iterate(to, finish) {
  this._iterateDom(to, !!finish);
};

DomIterator.prototype.countHooks = function countHooks() {
  return this._hooks.length;
}

/**
 * Iterates over the DOM, running registered hooks on elements between `start`
 * and `to`.
 *
 * @param {Object} to - The element to finish on
 * @param {Object} [finish] - Whether to iterate to the end of the `to` element or not
 * @param {Object} [start] - The element to start on
 * @private
 */
DomIterator.prototype._iterateDom = function iterateDom(to, finish, start) {
  if (!this._lastDomElement) {
    this._lastDomElement = this._$container.children()[0];
  }

  // If we haven't passed a "start" element, then this is the first.
  // We need to check that the target `to` is after `start` and is contained
  // in the presentation element.
  if (!start) {
    if (!$.contains(this._$container[0], to)) {
      return true;
    }

    var $containerChildren = this._$container.find('*');

    start = this._lastDomElement;

    var startIndex = $($containerChildren).index(start);
    var endIndex = $($containerChildren).index(to);

    if (startIndex >= endIndex) {
      return true;
    }
  }

  this._lastDomElement = start;

  if ((start == to) && (!finish)) {
    return true;
  }

  var self = this;
  var $start = $(start);

  var exits = [];

  // Find all matching hooks
  self._runDomHooks($start);

  var $children = $start.children();

  if ($children.length > 0) {
    if (this._iterateDom(to, finish, $children[0])) {
      return true;
    }
  }

  return this._finishDomElement(start, to, finish);
};

/**
 * @private
 */
DomIterator.prototype._finishDomElement = function finishDomElement(element, to, finish) {
  var $element = $(element);

  this._runDomHooks($element, true);

  if (element == to) {
    this._lastDomElement = element;
    return true;
  }

  // Find sibling
  var $sibling = $element.next();

  if ($sibling.length > 0) {
    return this._iterateDom(to, finish, $sibling[0]);
  }

  // Find parent
  var $parent = $element.parent();

  if ($parent.length > 0) {
    return this._iterateDom(to, finish, $parent[0]);
  }

  // Nothing else to traverse, just say we're finished
  return true;
};

/**
 * Runs the hooks for a particular element
 *
 * @param {Object} $element - jQuery element to run hooks for
 * @param {Boolean} end - Whether this should run "finishing" hooks or not
 * @private
 */
DomIterator.prototype._runDomHooks = function runDomHooks($element, end) {
  var self = this;
  end = !!end;
  this._hooks.forEach(function (adder) {
    if (($element.is(adder.selector)) &&
        (((adder.options.on === 'exit') && (end)) || ((adder.options.on !== 'exit') && (!end)))) {
      self.callback.call(null, adder.hook, $element);
    }
  });
};

export default DomIterator;
