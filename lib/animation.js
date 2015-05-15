var $ = jQuery;
import animations from './animations';

/**
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
  this.beforeState = { };

  if ((this.options.entrance) && (this.isOnDOM) && (this.direction === 1)) {
    this.$element.css('visibility', 'hidden');
  }
}

Animation.prototype.run = function run(context, callback) {
  if (this.definition.beforeState) {
    this.definition.beforeState.call(this, context);
  }

  this.definition.call(this, context, callback);
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
