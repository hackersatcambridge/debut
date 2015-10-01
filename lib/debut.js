// Reminder: All external dependencies are globals
var $ = jQuery;
import Animation from './animation';
import PresenterView from './presenter';
import screenfull from 'screenfull';

/** @module Debut */

/**
 * The primary Debut object is responsible for handling the presentation.
 *
 * @constructor Debut
 * @param element - The element to turn into a presentation
 * @param options
 */
var Debut = function Debut(element, options) {
  // Store jQuery objects for later reference
  this.$ = { };
  this.elements = { };

  this.options = $.extend({ }, Debut.defaultOptions, options);

  this.elements.container = element;
  this.$.container = $(this.elements.container);

  this.$.container.addClass('debut-container');
  var optionClasses = ['focusFlash'];
  optionClasses.forEach(function (c) {
    if (this.options[c]) {
      this.$.container.addClass('debut-option-' + c.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
    }
  }.bind(this));

  this.$.container.attr('tabindex', '1');
  this.$.innerContainer = this.$.container.wrapInner('<div class="debut-container-inner">').children();
  this.$.innerContainer.css({ width: this.options.baseWidth, height: this.options.baseWidth / this.options.aspect });
  this.elements.innerContainer = this.$.innerContainer[0];

  this._presenterViewWindow = null;

  this._lastDomElement = null;
  this._animationAdders = [ ];

  this.bounds = { };

  this.animationQueue = [ ];
  this.animationIndex = 0;

  this.milestones = [ ];

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
    bounds.left = (bounds.outerWidth - (this.options.baseWidth * bounds.scale)) / 2;
  } else {
    bounds.scale = bounds.outerWidth / this.options.baseWidth;
    bounds.top = (bounds.outerHeight - (this.options.baseWidth / this.options.aspect * bounds.scale)) / 2;
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
    this.$.container.click(function () {
      if (this._focusState === 1) {
        this._focusState = 0;
      } else if (this._focusState === 0) {
        this.next();
      }
    }.bind(this));

    this.$.container.on('focus', function () {
      this._focusState = 1;
    }.bind(this));

    this.$.container.on('blur', function () {
      this._focusState = 2;
    }.bind(this));
  }

  $(window).on('beforeunload', function () {
    if (this._presenterViewWindow) {
      this._presenterViewWindow.close();
    }
  }.bind(this));

  if (this.options.keys) {
    var checkKeys = function (keys, e, fn) {
      var self = this;
      this.options.keys[keys].forEach(function (key) {
        if (e.which === key) {
          fn.call(self);
        }
      });
    }.bind(this);

    this.$.container.keyup(function (e) {
      checkKeys('next', e, this.next);
      checkKeys('prev', e, this.prev);
      checkKeys('presenter', e, this.openPresenterView.bind(this, this.options.presenterUrl));
      checkKeys('fullscreen', e, this.toggleFullscreen);
    }.bind(this));
  }
};

/**
 * Adds an animation to the animation queue. If an element is supplied, the animation
 * will be applied to that element. Otherwise, the animation function will simply be
 * executed
 *
 * @param {object|string} [element] - The element to animate over
 * @param {function|string} animation - The animation name or definition
 * @param {object} [options]
 * @returns {object} This Debut instance
 */
Debut.prototype.step = function step(element, animation, options) {
  options = options || { };

  if (typeof element === 'string') {
    element = $(element);
  }

  // step(function, options) syntax
  if (typeof element === 'function') {
    animation = element;
    element = { };
  }

  if (typeof animation === 'string') {
    animation = Debut.animations[animation];
  }

  animation = new Animation(animation, $.extend({ }, { element: element }, options));

  var to = $(options.to)[0] || element instanceof $ ? element[0] : element;

  if ((this._animationAdders.length > 0) && (to instanceof HTMLElement)) {
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
      animation = [ oldAnimation, animation ];
    }
  }

  this.animationQueue.push(animation);

  return this;
};

/**
 * Adds an animation to the animation queue that starts with the previous animation
 *
 * @param {object|string} [element]
 * @param {function|string} animation
 * @param {object} [options]
 * @returns {object} This Debut instance
 */
Debut.prototype.and = function and(element, animation, options) {
  options = $.extend({ start: 'with' }, options);

  return this.step(element, animation, options);
};

/**
 * Adds an animation to the queue that starts after the previous animation
 *
 * @param {object|string} [element]
 * @param {function|string} animation
 * @param {object} [options]
 * @returns {object} This Debut instance
 */
Debut.prototype.then = function then(element, animation, options) {
  options = $.extend({ start: 'after' }, options);

  return this.step(element, animation, options);
};

/**
 * Adds a hook for animations to be added for certain selectors in the DOM
 *
 * @param {String} selector - CSS selector to determine elements
 * @param {Function} hook - Function of the form hook(debut, element) to be called for valid elements
 * @param {Object} [options] - Extra options
 */
Debut.prototype.all = function all(selector, hook, options) {
  options = options || { };

  this._animationAdders.push({
    selector: selector,
    hook: hook,
    options: options
  });

  return this;
};

/**
 * Indicate that the presentation is ready to run
 *
 * @return {Object} This Debut instance
 */
Debut.prototype.ready = function ready() {
  this._iterateDom(this.$.innerContainer.children().last()[0], true);

  return this;
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
Debut.prototype._iterateDom = function iterateDom(to, finish, start) {
  finish = !!finish;

  if (!this._lastDomElement) {
    this._lastDomElement = this.$.innerContainer.children()[0];
  }

  // If we haven't passed a "start" element, then this is the first.
  // We need to check that the target `to` is after `start` and is contained
  // in the presentation element.
  if (!start) {
    if (!$.contains(this.elements.container, to)) {
      return true;
    }

    var $containerChildren = this.$.container.find('*');

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
}

/**
 * @private
 */
Debut.prototype._finishDomElement = function finishDomElement(element, to, finish) {
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
 * @private
 */
Debut.prototype._runDomHooks = function runDomHooks($element, end) {
  var self = this;
  end = !!end;
  this._animationAdders.forEach(function (adder) {
    if (($element.is(adder.selector)) &&
        (((adder.options.on === 'exit') && (end)) || ((adder.options.on !== 'exit') && (!end)))) {
      adder.hook.call(self, self, $element[0])
    }
  })
};

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
    Animation._runArray(animation, context);
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
      if ((!found) && (milestone.name.toLocaleLowerCase() === index.toLocaleLowerCase())) {
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

  var proceed = function () {
    var cb = callback;
    if (((direction === 1) && (this.animationIndex < index - 1)) ||
        ((direction === -1) && (this.animationIndex > index + 1))) {
      cb = proceed;
    }

    this.proceed(direction, cb, true);
  }.bind(this);

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
  if (screenfull.enabled) {
    screenfull.toggle(this.elements.container);
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

  this._presenterViewWindow.onload = function () {
    this.presenterView = new PresenterView(
      $(this._presenterViewWindow.document).find('.debut-presenter-view')[0],
      this,
      this._presenterViewWindow
    );

    if (callback) {
      callback();
    }
  }.bind(this);

  $(this._presenterViewWindow).on('beforeunload', function () {
    this._presenterViewWindow = null;
    this.presenterView = null;
  }.bind(this));

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
  if ((ind < 0) || (ind >= this.animationQueue.length)) {
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
    next: [ 39 /* Right Arrow */, 34 /* Page Down */ ],
    prev: [ 37 /* Left Arrow */, 33 /* Page Up */ ],
    presenter: [ 80 /* P key */ ],
    fullscreen: [ 70 /* F key */ ]
  },
  clickToProceed: true,
  presenterUrl: 'presenter.html',
  focusFlash: true
};

// Export everything
Debut.Animation = Animation;
Debut.animations = Animation.animations;
Debut.PresenterView = PresenterView;

export default Debut;
