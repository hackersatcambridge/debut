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
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _animations = _dereq_('./animations');

var _animations2 = _interopRequireDefault(_animations);

var $ = jQuery;

/**
 *
 * The Animation object represents a single animation in the animation queue.
 * It contains all options for a single animation, such as the kind of animation, and the direction it is going in.
 * It is responsible for running an animation, and eventually getting a callback back to the Debut instance
 *
 * @constructor Animation
 * @memberof Debut
 */
var Animation = function Animation(definition, options) {
  this.options = $.extend({}, Animation.defaultOptions, definition.defaultOptions || {}, options);
  this.definition = definition;

  this.easing = this.options.easing;
  this.duration = this.options.duration;
  this.delay = this.options.delay;
  this.start = this.options.start;
  this.element = this.options.element;
  this.$element = $(this.element);
  this.direction = this.options.direction * (this.options.reverse ? -1 : 1);
  this.isJQuery = this.element instanceof $;
  this.isOnDOM = this.element instanceof HTMLElement || this.isJQuery; // Not always true but we will continue
  this.firstRun = true;

  this.stores = [];
  this.contexts = [];
  this.elements = [];
  this.$elements = [];

  if (this.isHidden() && this.direction === 1) {
    this.$element.css('visibility', 'hidden');
  }

  var self = this;

  if (this.options.separateElements) {
    this.$element.each(function () {
      self.stores.push({});
      self.contexts.push({});
      self.elements.push(this);
      self.$elements.push($(this));
    });
  } else {
    self.stores.push({});
    self.contexts.push({});
    self.elements.push(this.element);
    self.$elements.push(this.$element);
  }
};

Animation.prototype._run = function run(context, callback) {
  callback = callback || function () {};
  context.duration = context.fast ? 0 : this.duration;
  context.options = this.options;

  var finished = [];

  this.$elements.forEach(function (element, ind) {
    finished[ind] = 1;
  });

  this.$elements.forEach((function (element, ind) {
    var newContext = this.contexts[ind];
    var done = false;
    var newCallback = function newCallback() {
      finished[ind] = 0;
      if (!done && finished.indexOf(1) === -1) {
        done = true;
        callback();
      }
    };

    for (var i in context) {
      newContext[i] = context[i];
    }

    newContext.element = this.elements[ind];
    newContext.$element = this.$elements[ind];
    newContext.store = this.stores[ind];

    this._runWithContext(newContext, newCallback);
  }).bind(this));

  this.firstRun = false;
};

Animation.prototype._runWithContext = function run(context, callback) {
  if (this.firstRun && !context.reversed && this.definition.beforeState) {
    this.definition.beforeState.call(this, context);
  }

  if (this.definition.prepare) {
    this.definition.prepare.call(this, context);
  }

  if (this.isHidden()) {
    if (context.direction === 1) {
      context.$element.css('visibility', '');
    } else {
      var oldCallback = callback;
      callback = (function callback() {
        context.$element.css('visibility', 'hidden');
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

/**
 * Default options for *all* animations.
 *
 * @memberof Animation
 */
Animation.defaultOptions = {
  easing: 'easeInOutCubic',
  duration: 500,
  delay: 0,
  start: 'step',
  element: null,
  entrance: false,
  reverse: false,
  direction: 1,
  separateElements: true
};

/**
 * Runs through an array of animations. Forwards or backwards, takes into account delays
 * and all of that nonsense.
 *
 * @function
 * @memberof Animation
 * @private
 */
Animation._runArray = function _runArray(array, context, ind) {
  var direction = context.direction;

  if (typeof ind === 'undefined') {
    ind = direction === 1 ? 0 : array.length;
  }

  if (direction === -1) {
    ind -= 1;
  }

  var animation = array[ind];
  var otherAnimation = null;
  var animationMode = null;
  var final = false;

  if (direction === 1) {
    ind += 1;

    // Remember: ind has already been increased
    if (ind < array.length) {
      otherAnimation = array[ind];
      animationMode = otherAnimation.start;
    } else {
      final = true;
    }
  } else {
    // Remember: ind has already been decreased
    if (ind > 0) {
      otherAnimation = array[ind - 1];
      animationMode = animation.start;
    } else {
      final = true;
    }
  }

  var callback = final ? context.callback : undefined;

  if (animationMode == 'after') {
    callback = Animation._runArray.bind(this, array, context, ind);
    var refAnimation = direction === 1 ? otherAnimation : animation;
    if (refAnimation.delay > 0 && !context.fast) {
      var oldCallback = callback;
      callback = function () {
        setTimeout(oldCallback, refAnimation.delay);
      };
    }
  }

  var contextToSend = {
    debut: context.debut,
    direction: animation.direction * direction,
    reversed: direction === -1,
    fast: context.fast
  };

  var next = (function () {
    animation._run(contextToSend, callback);

    if (animationMode == 'with') {
      if (direction === 1) {
        if (otherAnimation.delay > 0 && !context.fast) {
          setTimeout(Animation._runArray.bind(this, array, context, ind), otherAnimation.delay);
        } else {
          Animation._runArray(array, context, ind);
        }
      } else {
        if (animation.delay > 0 && !context.fast) {
          // If this animation was delayed when going forwards,
          // Going backwards, the previous animation needs to be delayed
          var delay = Math.max(animation.delay + animation.duration - otherAnimation.duration, 0);
          setTimeout(Animation._runArray.bind(this, array, context, ind), delay);
        } else {
          Animation._runArray(array, context, ind);
        }
      }
    }
  }).bind(this);

  if (animation.delay > 0 && !context.fast && direction === 1 && animation.step === 'start') {
    setTimeout(next, animation.delay);
  } else {
    next();
  }
};

Animation.animations = _animations2['default'];

exports['default'] = Animation;
module.exports = exports['default'];

},{"./animations":2}],2:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var $ = jQuery;

var animations = {};

/**
 * The appear animation is the most simple. All it does is make the element appear.
 * The logic is empty because animations naturally handle hiding and showing entrance animations.
 */
animations.appear = function (context, callback) {
  setTimeout(callback.bind(this), context.duration);
};

animations.appear.beforeState = function beforeState(context) {};

animations.appear.defaultOptions = {
  entrance: true,
  duration: 0
};

/**
 * Fades the element in
 */
animations.fade = function (context, callback) {
  context.$element.transit({
    opacity: context.direction === 1 ? context.store.opacity : 0
  }, {
    duration: context.duration,
    easing: context.options.easing,
    complete: callback
  });
};

animations.fade.prepare = function (context) {
  if (context.direction === 1) {
    context.$element.css('opacity', 0);
  }
};

animations.fade.beforeState = function beforeState(context) {
  context.store.opacity = context.$element.css('opacity');
};

animations.fade.defaultOptions = {
  entrance: true,
  duration: 500
};

/**
 * Slides the element in from a side of the screen
 */
animations.slide = function slide(context, callback) {
  context.$element.transit({
    x: '+=' + -context.direction * context.store.leftShift,
    y: '+=' + -context.direction * context.store.topShift
  }, {
    duration: context.duration,
    easing: context.options.easing,
    complete: callback
  });
};

animations.slide.prepare = function prepare(context) {
  var leftShift = 0;
  var topShift = 0;

  if (context.direction === 1) {
    context.$element.css({
      x: context.store.x,
      y: context.store.y
    });
  }

  var position = context.debut.offset(context.$element);

  switch (context.options.from) {
    default:
    case 'left':
      leftShift = -(context.$element.width() + position.left);
      break;
    case 'right':
      leftShift = context.debut.bounds.visibleWidth - position.left;
      break;
    case 'top':
      topShift = -(context.$element.height() + position.top);
      break;
    case 'bottom':
      topShift = context.debut.bounds.visibleHeight - position.top;
      break;
  }

  if (context.direction === 1) {
    context.$element.css({
      x: '+=' + context.direction * leftShift,
      y: '+=' + context.direction * topShift
    });
  }

  context.store.leftShift = leftShift;
  context.store.topShift = topShift;
};

animations.slide.beforeState = function beforeState(context) {
  context.store.x = context.$element.css('x');
  context.store.y = context.$element.css('y');
};

animations.slide.defaultOptions = {
  entrance: true,
  from: 'left'
};

/**
 * Class changing animations
 */
animations.toggleclass = function toggleclass(context, callback) {
  var classState = !context.store.hasClass && !context.reversed;
  if (classState) {
    context.$element.addClass(context.options['class']);
  } else {
    context.$element.removeClass(context.options['class']);
  }

  setTimeout(callback.bind(this), context.duration);
};

animations.toggleclass.beforeState = function beforeState(context) {
  context.store.hasClass = context.$element.hasClass(context.options['class']);
};

animations.toggleclass.defaultOptions = {
  duration: 0
};

/**
 * Allows you to arbitrarily animate css using css transitions
 *
 * Uses Transit internally, so look to their documentation
 */
animations.animatecss = function animatecss(context, callback) {
  var toGo = context.reversed ? context.store.props : context.options.props;

  context.$element.transit(toGo, {
    duration: context.duration,
    easing: context.options.easing,
    complete: callback,
    queue: false
  });
};

animations.animatecss.beforeState = function beforeState(context) {
  context.store.props = {};
  for (var key in context.options.props) {
    context.store.props[key] = context.$element.css(key);
  }
};

animations.animatecss.defaultOptions = {
  easing: 'ease'
};

/**
 * Allows you to arbitrarily animate any property
 *
 * Uses jQuery's animate API internally
 *
 * TODO: Keep track of multiple elements if necessary
 */
animations.animate = function animate(context, callback) {
  var toGo = context.reversed ? context.store.props : context.options.props;

  context.$element.animate(toGo, {
    duration: context.duration,
    easing: context.options.easing,
    complete: callback,
    queue: false
  });
};

animations.animate.beforeState = function beforeState(context) {
  context.store.props = {};
  for (var key in context.options.props) {
    context.store.props[key] = context.$element.attr(key);
  }
};

animations.animate.defaultOptions = {
  easing: 'swing'
};

exports['default'] = animations;
module.exports = exports['default'];

},{}],3:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _animation = _dereq_('./animation');

var _animation2 = _interopRequireDefault(_animation);

var _presenter = _dereq_('./presenter');

var _presenter2 = _interopRequireDefault(_presenter);

var _screenfull = _dereq_('screenfull');

var _screenfull2 = _interopRequireDefault(_screenfull);

// Reminder: All external dependencies are globals
var $ = jQuery;

/** @module Debut */

/**
 * The primary Debut object is responsible for handling the presentation.
 *
 * @constructor Debut
 */
var Debut = function Debut(element, options) {
  // Store jQuery objects for later reference
  this.$ = {};
  this.elements = {};

  this.options = $.extend({}, Debut.defaultOptions, options);

  this.elements.container = element;
  this.$.container = $(this.elements.container);

  this.$.container.addClass('debut-container');
  var optionClasses = ['focusFlash'];
  optionClasses.forEach((function (c) {
    if (this.options[c]) {
      this.$.container.addClass('debut-option-' + c.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
    }
  }).bind(this));

  this.$.container.attr('tabindex', '1');
  this.$.innerContainer = this.$.container.wrapInner('<div class="debut-container-inner">').children();
  this.$.innerContainer.css({ width: this.options.baseWidth, height: this.options.baseWidth / this.options.aspect });
  this.elements.innerContainer = this.$.innerContainer[0];

  this._presenterViewWindow = null;

  this._lastDomElement = null;
  this._animationAdders = [];

  this.bounds = {};

  this.animationQueue = [];
  this.animationIndex = 0;

  this.milestones = [];

  if (this.options.full) {
    this.$.container.addClass('debut-full');
  }

  if (this.options.letterbox) {
    this.$.container.addClass('debut-letterbox');
  }

  this._addEventListeners();
  this.milestone('Start');
};

/**
 * Updates the width and height of the presentation based on the size of its container.
 * Called automatically on window resize. In other cases, you will need to call it yourself
 */
Debut.prototype.resize = function resize(event) {
  var bounds = this.bounds;
  bounds.width = this.$.innerContainer.width();
  bounds.height = this.$.innerContainer.height();
  bounds.outerWidth = this.$.container.width();
  bounds.outerHeight = this.$.container.height();
  bounds.aspect = bounds.outerWidth / bounds.outerHeight;

  if (this.options.letterbox) {
    bounds.visibleWidth = bounds.width;
    bounds.visibleHeight = bounds.height;
  } else {
    bounds.visibleWidth = bounds.outerWidth;
    bounds.visibleHeight = bounds.outerHeight;
  }

  if (bounds.aspect > this.options.aspect) {
    bounds.scale = bounds.outerHeight / (this.options.baseWidth / this.options.aspect);
    bounds.top = 0;
    bounds.left = (bounds.outerWidth - this.options.baseWidth * bounds.scale) / 2;
  } else {
    bounds.scale = bounds.outerWidth / this.options.baseWidth;
    bounds.top = (bounds.outerHeight - this.options.baseWidth / this.options.aspect * bounds.scale) / 2;
    bounds.left = 0;
  }

  this.$.innerContainer.css({ scale: bounds.scale, top: bounds.top, left: bounds.left });
};

/**
 * Listens to relevant events and binds callbacks
 * @private
 */
Debut.prototype._addEventListeners = function addEventListeners() {
  this.resize();
  $(window).on('resize', this.resize.bind(this));

  if (this.options.clickToProceed) {
    // First click lets the presentation gain focus, second lets you proceed
    this.$.container.click((function () {
      if (this._focusState === 1) {
        this._focusState = 0;
      } else if (this._focusState === 0) {
        this.next();
      }
    }).bind(this));

    this.$.container.on('focus', (function () {
      this._focusState = 1;
    }).bind(this));

    this.$.container.on('blur', (function () {
      this._focusState = 2;
    }).bind(this));
  }

  $(window).on('beforeunload', (function () {
    if (this._presenterViewWindow) {
      this._presenterViewWindow.close();
    }
  }).bind(this));

  if (this.options.keys) {
    var checkKeys = (function (keys, e, fn) {
      var self = this;
      this.options.keys[keys].forEach(function (key) {
        if (e.which === key) {
          fn.call(self);
        }
      });
    }).bind(this);

    this.$.container.keyup((function (e) {
      checkKeys('next', e, this.next);
      checkKeys('prev', e, this.prev);
      checkKeys('presenter', e, this.openPresenterView.bind(this, this.options.presenterUrl));
      checkKeys('fullscreen', e, this.toggleFullscreen);
    }).bind(this));
  }
};

/**
 * Adds an animation to the animation queue
 */
Debut.prototype.step = function step(element, animation, options) {
  options = options || {};

  if (typeof element === 'string') {
    element = $(element);
  }

  // step(function, options) syntax
  if (typeof element === 'function') {
    animation = element;
    element = {};
  }

  if (typeof animation === 'string') {
    animation = Debut.animations[animation];
  }

  animation = new _animation2['default'](animation, $.extend({}, { element: element }, options));

  var to = $(options.to)[0] || element instanceof $ ? element[0] : element;

  if (this._animationAdders.length > 0 && to instanceof HTMLElement) {
    this._iterateDom(to);
  }

  // Group animations that are to be played together
  if (animation.start !== 'step') {
    if (this.animationQueue.length === 0) {
      throw new Error('First animation start type must be step');
    }

    var oldAnimation = this.animationQueue.pop();

    if (oldAnimation instanceof Array) {
      oldAnimation.push(animation);
      animation = oldAnimation;
    } else {
      animation = [oldAnimation, animation];
    }
  }

  this.animationQueue.push(animation);

  return this;
};

/**
 * Adds an animation to the animation queue that starts with the previous animation
 */
Debut.prototype.and = function and(element, animation, options) {
  options = $.extend({ start: 'with' }, options);

  return this.step(element, animation, options);
};

/**
 * Adds an animation to the queue that starts after the previous animation
 */
Debut.prototype.then = function then(element, animation, options) {
  options = $.extend({ start: 'after' }, options);

  return this.step(element, animation, options);
};

/**
 * Adds a hook for animations to be added for certain selectors in the DOM
 *
 * Does not work
 *
 * @param {String} selector - CSS selector to determine elements
 * @param {Function} hook - Function of the form hook(debut, element) to be called for valid elements
 * @param {Object} [options] - Extra options
 */
Debut.prototype.all = function all(selector, hook, options) {
  options = options || {};

  this._animationAdders.push({
    selector: selector,
    hook: hook,
    options: options
  });

  return this;
};

Debut.prototype._iterateDom = function iterateDom(to) {};

/**
 * Proceed to the next state of the presentation
 */
Debut.prototype.next = function next() {
  if (this.animationIndex < this.animationQueue.length) {
    this.proceed(1);
  }
};

/**
 * Proceed to the previous state of the presentation
 */
Debut.prototype.prev = function prev() {
  if (this.animationIndex > 0) {
    this.proceed(-1);
  }
};

/**
 * Go forwards or backwards in the presentation state
 *
 * @param {Number} direction - Forwards (1) or backwards (-1)?
 *
 * @private
 */
Debut.prototype.proceed = function proceed(direction, callback, fast) {
  if (direction === -1) {
    this.animationIndex -= 1;
  }

  var animation = this.animationQueue[this.animationIndex];

  if (direction === 1) {
    this.animationIndex += 1;
  }

  var context = {
    direction: direction,
    reversed: direction === -1,
    debut: this,
    fast: !!fast
  };

  if (animation instanceof Array) {
    context.callback = callback;
    _animation2['default']._runArray(animation, context);
  } else {
    context.direction *= animation.direction;
    animation._run(context, callback);
  }
};

/**
 * Go to a state in the presentation
 *
 * @param {Number|String} index - Index of the animation queue or name of milestone
 */
Debut.prototype.goTo = function goTo(index, callback) {
  if (typeof index === 'string') {
    var found = false;
    this.milestones.forEach(function (milestone) {
      if (!found && milestone.name.toLocaleLowerCase() === index.toLocaleLowerCase()) {
        found = true;
        index = milestone.index;
      }
    });
  }
  index = Math.max(0, Math.min(this.animationQueue.length, index));

  var difference = index - this.animationIndex;
  if (difference === 0) {
    return;
  }

  var direction = difference > 0 ? 1 : -1;
  console.log(direction, difference, index);

  var proceed = (function () {
    var cb = callback;
    if (direction === 1 && this.animationIndex < index - 1 || direction === -1 && this.animationIndex > index + 1) {
      cb = proceed;
    }

    this.proceed(direction, cb, true);
  }).bind(this);

  proceed();
};

/**
 * Add a milestone
 *
 * @param {String} name - The name of the milestone
 * @param {Object} [metadata] - Any metadata to associate with the milestone
 */
Debut.prototype.milestone = function addMilestone(name, metadata) {
  var ind = this.animationQueue.length;
  var lastMilestone = null;

  if (this.milestones.length > 0) {
    lastMilestone = this.milestones[this.milestones.length - 1];
  }

  // Replace an existing milestone if it is on the same index
  if (lastMilestone !== null) {
    if (lastMilestone.index === ind) {
      this.milestones.pop();
    }
  }

  var milestone = {
    name: name,
    index: ind,
    metadata: metadata
  };

  this.milestones.push(milestone);

  return this;
};

/**
 * Toggles fullscreen status
 */
Debut.prototype.toggleFullscreen = function toglleFullscreen() {
  if (_screenfull2['default'].enabled) {
    _screenfull2['default'].toggle(this.elements.container);
  }
};

/**
 * Open presenter view
 */
Debut.prototype.openPresenterView = function openPresenterView(url, callback) {
  if (this._presenterViewWindow) {
    this._presenterViewWindow.close();
  }

  this._presenterViewWindow = window.open(url, 'Debut Presenter View', 'height=800,width=1000,modal=yes');
  console.log(this._presenterViewWindow);

  this._presenterViewWindow.onload = (function () {
    this.presenterView = new _presenter2['default']($(this._presenterViewWindow.document).find('.debut-presenter-view')[0], this, this._presenterViewWindow);

    if (callback) {
      callback();
    }
  }).bind(this);

  $(this._presenterViewWindow).on('beforeunload', (function () {
    this._presenterViewWindow = null;
    this.presenterView = null;
  }).bind(this));

  return this.presenterView;
};

/**
 * Get the animation for a particular index.
 *
 * @param {Number} ind - The index of the animation
 *
 * @returns {Animation|null} The animation if it exists, null if it does not.
 */
Debut.prototype.getAnimation = function getAnimation(ind) {
  if (ind < 0 || ind >= this.animationQueue.length) {
    return null;
  }

  return this.animationQueue[ind];
};

/**
 * Determines the offset of an element in presentation coordinates
 *
 * @returns {Object} offset - Object containing coordinates
 * @returns {Number} offset.left - The left offset in pixels
 * @returns {Number} offset.right - The right offset in pixels
 */
Debut.prototype.offset = function changeOffset(element) {
  if (!(element instanceof $)) {
    element = $(element);
  }

  var offset = element.offset();

  offset.left = (offset.left - this.bounds.left) / this.bounds.scale;
  offset.top = (offset.top - this.bounds.top) / this.bounds.scale;

  return offset;
};

Debut.defaultOptions = {
  full: true,
  fullscreen: false,
  aspect: 16 / 9,
  baseWidth: 1000,
  letterbox: true,
  keys: {
    next: [39 /* Right Arrow */, 34 /* Page Down */],
    prev: [37 /* Left Arrow */, 33 /* Page Up */],
    presenter: [80 /* P key */],
    fullscreen: [70 /* F key */]
  },
  clickToProceed: true,
  presenterUrl: 'presenter.html',
  focusFlash: true
};

// Export everything
Debut.Animation = _animation2['default'];
Debut.animations = _animation2['default'].animations;
Debut.PresenterView = _presenter2['default'];

exports['default'] = Debut;
module.exports = exports['default'];

// TODO: Iterate over DOM recursively until we reach start of TO element
// and execute hooks where necessary
// Keep track of last "to" element for next iteration

},{"./animation":1,"./presenter":4,"screenfull":5}],4:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var $ = jQuery;

/**
 * Class to handle opening and events in the presenter view.
 * Uses haxe to allow it to run in another window
 *
 * @constructor
 */
var PresenterView = function PresenterView(element, debut, win, doc) {
  this.debut = debut;

  if (typeof win === 'undefined') {
    win = window;
  }

  if (typeof doc === 'undefined') {
    doc = win.document;
  }

  this.elements = {
    container: element,
    window: win,
    document: doc
  };

  this.$ = {
    container: $(element),
    window: $(win),
    document: $(doc)
  };

  this.$.milestones = this.$.container.find('.debut-milestones');
  this.elements.milestones = this.$.milestones[0];

  this._addMilestones();

  this.$.container.find('.debut-button-next').click(debut.next.bind(debut));
  this.$.container.find('.debut-button-prev').click(debut.prev.bind(debut));

  this.resetTimer();
  this.startTimer();

  this.$.container.find('.debut-button-reset-timer').click(this.resetTimer.bind(this));
  this.$.container.find('.debut-button-pause-timer').click(this.toggleTimer.bind(this));

  if (this.debut.options.keys) {
    var checkKeys = (function (keys, e, fn) {
      var self = this;
      this.debut.options.keys[keys].forEach(function (key) {
        if (e.which === key) {
          fn.call(self);
        }
      });
    }).bind(this);

    this.$.window.keyup((function (e) {
      checkKeys('next', e, debut.next.bind(debut));
      checkKeys('prev', e, debut.prev.bind(debut));
    }).bind(this));
  }
};

/**
 * Adds milestones to the navigation
 *
 * @private
 */
PresenterView.prototype._addMilestones = function addMilestones() {
  console.log('Add milestones', this.debut.milestones);
  this.debut.milestones.forEach((function (milestone) {
    console.log(milestone);
    var element = $('<button class="debut-button debut-milestone">' + milestone.name + '</div>');

    element.click((function () {
      this.debut.goTo(milestone.index);
    }).bind(this));

    this.$.milestones.append(element);
  }).bind(this));
};

/**
 * Starts the timer in the presenter view
 */
PresenterView.prototype.startTimer = function startTimer() {
  console.log('Start');
  if (!this.isPlaying()) {
    var now = Date.now();
    this.startTime += now - this.lastTime;
    this.lastTime = now;

    this.interval = setInterval(this._renderTimer.bind(this), 500);
    this._renderTimer();

    this.$.document.find('.debut-button-pause-timer').text('Pause Timer');
  }
};

/**
 * Pausess the timer in the presenter view
 */
PresenterView.prototype.pauseTimer = function stopTimer() {
  console.log('Pause');
  if (this.isPlaying()) {
    clearInterval(this.interval);
    this.interval = null;

    this.$.document.find('.debut-button-pause-timer').text('Start Timer');
  }
};

/**
 * Resets the timer in presenter view
 */
PresenterView.prototype.resetTimer = function resetTimer() {
  this.startTime = Date.now();
  this.lastTime = Date.now();
  this._renderTimer();

  if (this.isPlaying()) {
    this.pauseTimer();
    this.startTimer();
  }
};

/**
 * Toggles the timer state
 */
PresenterView.prototype.toggleTimer = function toggleTimer() {
  if (this.isPlaying()) {
    this.pauseTimer();
  } else {
    this.startTimer();
  }
};

/**
 * Is the timer playing?
 *
 * @returns {Bool} If the timer is playing
 */
PresenterView.prototype.isPlaying = function isPlaying() {
  return this.interval !== null;
};

/**
 * Internal function used to render the timer
 *
 * @private
 */
PresenterView.prototype._renderTimer = function _renderTimer() {
  var now = Date.now();
  var difference = now - this.startTime;
  this.lastTime = now;

  var minutes = Math.floor(difference / 60000);
  var seconds = Math.floor(difference / 1000 - minutes * 60);

  this.$.document.find('.debut-timer-number.debut-minutes').text(minutes);
  this.$.document.find('.debut-timer-number.debut-seconds').text(seconds);
};

exports['default'] = PresenterView;
module.exports = exports['default'];

},{}],5:[function(_dereq_,module,exports){
/*!
* screenfull
* v2.0.0 - 2014-12-22
* (c) Sindre Sorhus; MIT License
*/
(function () {
	'use strict';

	var isCommonjs = typeof module !== 'undefined' && module.exports;
	var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;

	var fn = (function () {
		var val;
		var valLength;

		var fnMap = [
			[
				'requestFullscreen',
				'exitFullscreen',
				'fullscreenElement',
				'fullscreenEnabled',
				'fullscreenchange',
				'fullscreenerror'
			],
			// new WebKit
			[
				'webkitRequestFullscreen',
				'webkitExitFullscreen',
				'webkitFullscreenElement',
				'webkitFullscreenEnabled',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			// old WebKit (Safari 5.1)
			[
				'webkitRequestFullScreen',
				'webkitCancelFullScreen',
				'webkitCurrentFullScreenElement',
				'webkitCancelFullScreen',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			[
				'mozRequestFullScreen',
				'mozCancelFullScreen',
				'mozFullScreenElement',
				'mozFullScreenEnabled',
				'mozfullscreenchange',
				'mozfullscreenerror'
			],
			[
				'msRequestFullscreen',
				'msExitFullscreen',
				'msFullscreenElement',
				'msFullscreenEnabled',
				'MSFullscreenChange',
				'MSFullscreenError'
			]
		];

		var i = 0;
		var l = fnMap.length;
		var ret = {};

		for (; i < l; i++) {
			val = fnMap[i];
			if (val && val[1] in document) {
				for (i = 0, valLength = val.length; i < valLength; i++) {
					ret[fnMap[0][i]] = val[i];
				}
				return ret;
			}
		}

		return false;
	})();

	var screenfull = {
		request: function (elem) {
			var request = fn.requestFullscreen;

			elem = elem || document.documentElement;

			// Work around Safari 5.1 bug: reports support for
			// keyboard in fullscreen even though it doesn't.
			// Browser sniffing, since the alternative with
			// setTimeout is even worse.
			if (/5\.1[\.\d]* Safari/.test(navigator.userAgent)) {
				elem[request]();
			} else {
				elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
			}
		},
		exit: function () {
			document[fn.exitFullscreen]();
		},
		toggle: function (elem) {
			if (this.isFullscreen) {
				this.exit();
			} else {
				this.request(elem);
			}
		},
		raw: fn
	};

	if (!fn) {
		if (isCommonjs) {
			module.exports = false;
		} else {
			window.screenfull = false;
		}

		return;
	}

	Object.defineProperties(screenfull, {
		isFullscreen: {
			get: function () {
				return !!document[fn.fullscreenElement];
			}
		},
		element: {
			enumerable: true,
			get: function () {
				return document[fn.fullscreenElement];
			}
		},
		enabled: {
			enumerable: true,
			get: function () {
				// Coerce to boolean in case of old WebKit
				return !!document[fn.fullscreenEnabled];
			}
		}
	});

	if (isCommonjs) {
		module.exports = screenfull;
	} else {
		window.screenfull = screenfull;
	}
})();

},{}],6:[function(_dereq_,module,exports){
// The __debut variable is defined in the context of the whole module definition
// Which allows it to export the debut object
'use strict';

__debut = _dereq_('./debut'); // jshint ignore:line

},{"./debut":3}]},{},[6]);

return __debut;
}));
