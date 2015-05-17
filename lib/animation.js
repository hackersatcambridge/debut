var $ = jQuery;
import animations from './animations';

/**
 * @constructor
 *
 * The Animation object represents a single animation in the animation queue.
 * It contains all options for a single animation, such as the kind of animation, and the direction it is going in.
 * It is responsible for running an animation, and eventually getting a callback back to the Debut instance
 */
var Animation = function Animation(definition, options) {
  this.options = $.extend(Animation.defaultOptions, definition.defaultOptions || { }, options);
  this.definition = definition;

  this.easing = this.options.easing;
  this.duration = this.options.duration;
  this.delay = this.options.delay;
  this.start = this.options.start;
  this.element = this.options.element;
  this.$element = $(this.element);
  this.direction = this.options.direction;
  this.isJQuery = (this.element instanceof $);
  this.isOnDOM = (this.element instanceof HTMLElement) || this.isJQuery; // Not always true but we will continue
  this.firstRun = true;
  this.store = { };

  if ((this.isHidden()) && (this.direction === 1)) {
    this.$element.css('visibility', 'hidden');
  }
};

Animation.prototype.run = function run(context, callback) {
  if ((!this.firstRun) && (!context.reversed) && (this.definition.beforeState)) {
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

Animation.defaultOptions = {
  easing: 'easeInOutCubic',
  duration: 500,
  delay: 0,
  start: 'step',
  element: null,
  entrance: false,
  direction: 1
};

Animation.animations = animations;

export default Animation;
