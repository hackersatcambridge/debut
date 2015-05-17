// Reminder: All external dependencies are globals
var $ = jQuery;
import Animation from './animation';

/**
 * The primary Debut object is responsible for handling the presentation.
 */
var Debut = function Debut(element, options) {
  // Store jQuery objects for later reference
  this.$ = { };
  this.elements = { };

  this.options = $.extend({ }, Debut.defaultOptions, options);

  this.elements.container = element;
  this.$.container = $(this.elements.container);

  this.$.container.addClass('debut-container');
  this.$.innerContainer = this.$.container.wrapInner('<div class="debut-container-inner">').children();
  this.$.innerContainer.css({ width: this.options.baseWidth, height: this.options.baseWidth / this.options.aspect });
  this.elements.innerContainer = this.$.innerContainer[0];


  this.bounds = { };

  this.animationQueue = [ ];
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

  if (this.options.letterbox) {
    this.bounds.visibleWidth = this.bounds.width;
    this.bounds.visibleHeight = this.bounds.height;
  } else {
    this.bounds.visibleWidth = this.bounds.outerWidth;
    this.bounds.visibleHeight = this.bounds.outerHeight;
  }

  if (this.bounds.aspect > this.options.aspect) {
    this.bounds.scale = this.bounds.outerHeight / (this.options.baseWidth / this.options.aspect);
    this.bounds.top = 0;
    this.bounds.left = (this.bounds.outerWidth - (this.options.baseWidth * this.bounds.scale)) / 2;
  } else {
    this.bounds.scale = this.bounds.outerWidth / this.options.baseWidth;
    this.bounds.top = (this.bounds.outerHeight - (this.options.baseWidth / this.options.aspect * this.bounds.scale)) / 2;
    this.bounds.left = 0;
  }

  this.$.innerContainer.css({ scale: this.bounds.scale, top: this.bounds.top, left: this.bounds.left });
};

/**
 * Adds an animation to the animation queue
 */
Debut.prototype.step = function step(element, animation, options) {
  if (typeof element === 'string') {
    element = $(element)[0];
  }

  animation = Debut.animations[animation];
  animation = new Animation(animation, $.extend({ }, { element: element }, options));

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
    reversed: (direction === -1)
  };

  animation.run(context, function () { });
};

/**
 * Determines the offset of an element in presentation coordinates
 *
 * @returns {Object} offset - Object containing coordinates
 * @returns {Number} offset.left - The left offset in pixels
 * @returns {Number} offset.right - The right offset in pixels
 */
Debut.prototype.offset = function offset(element) {
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
  baseWidth: 1600,
  letterbox: true
};

Debut.Animation = Animation;
Debut.animations = Animation.animations;

export default Debut;
