var $ = jQuery;
import animations from './animations';

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
  this.options = $.extend({ }, Animation.defaultOptions, definition.defaultOptions || { }, options);
  this.definition = definition;

  this.easing = this.options.easing;
  this.duration = this.options.duration;
  this.delay = this.options.delay;
  this.start = this.options.start;
  this.element = this.options.element;
  this.$element = $(this.element);
  this.direction = this.options.direction * (this.options.reverse ? -1 : 1);
  this.isJQuery = (this.element instanceof $);
  this.isOnDOM = (this.element instanceof HTMLElement) || this.isJQuery; // Not always true but we will continue
  this.firstRun = true;
  this.store = { };

  if ((this.isHidden()) && (this.direction === 1)) {
    this.$element.css('visibility', 'hidden');
  }
};

Animation.prototype.run = function run(context, callback) {
  callback = callback || function () { };

  if ((this.firstRun) && (!context.reversed) && (this.definition.beforeState)) {
    this.definition.beforeState.call(this, context);
    this.firstRun = false;
  }

  if (this.definition.prepare) {
    this.definition.prepare.call(this, context);
  }

  if (this.isHidden()) {
    if (context.direction === 1) {
      this.$element.css('visibility', '');
    } else {
      var oldCallback = callback;
      callback = function callback() {
        this.$element.css('visibility', 'hidden');
        oldCallback();
      }.bind(this);
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
  return ((this.isOnDOM) && (this.options.entrance));
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
  direction: 1
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
    if (refAnimation.delay > 0) {
      var oldCallback = callback;
      callback = function () {
        setTimeout(oldCallback, refAnimation.delay);
      };
    }
  }

  var contextToSend = {
    debut: context.debut,
    direction: animation.direction * direction,
    reversed: (direction === -1)
  };

  var next = function () {
    animation.run(contextToSend, callback);

    if (animationMode == 'with') {
      if (direction === 1) {
        if (otherAnimation.delay > 0) {
          setTimeout(Animation._runArray.bind(this, array, context, ind), otherAnimation.delay);
        } else {
          Animation._runArray(array, context, ind);
        }
      } else {
        if (animation.delay > 0) {
          // If this animation was delayed when going forwards,
          // Going backwards, the previous animation needs to be delayed
          var delay = Math.max(animation.delay + animation.duration - otherAnimation.duration, 0);
          setTimeout(Animation._runArray.bind(this, array, context, ind), delay);
        } else {
          Animation._runArray(array, context, ind);
        }
      }
    }
  }.bind(this);

  if ((animation.delay > 0) && (direction === 1) && (animation.step === 'start')) {
    setTimeout(next, animation.delay);
  } else {
    next();
  }
};

Animation.animations = animations;

export default Animation;
