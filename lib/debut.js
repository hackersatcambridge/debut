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
  this.$.innerContainer = $('<div class="debut-container-inner">');
  this.$.innerContainer.css({ width: this.options.baseWidth, height: this.options.baseWidth / this.options.aspect });
  this.elements.innerContainer = this.$.innerContainer[0];
  this.$.container.append(this.$.innerContainer);

  this.bounds = { };

  this.animationQueue = [ ];

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
    left = (this.bounds.outerWidth - (this.options.baseWidth * scale)) / 2;
  } else {
    scale = this.bounds.outerWidth / this.options.baseWidth;
    top = (this.bounds.outerHeight - (this.options.baseWidth / this.options.aspect * scale)) / 2;
    left = 0;
  }

  this.$.innerContainer.css({ scale: scale, top: top, left: left });
};

/**
 * Adds an animation to the animation queue
 */
Debut.prototype.step = function step(element, animation, options) {
  if (typeof element === 'String') {
    element = $(element)[0];
  }

  animation = Debut.animations[animation];
  animation = new Animation($.extend({ }, { element: element }, options));

  this.animationQueue.push(animation);
};

Debut.defaultOptions = {
  full: true,
  fullscreen: false,
  aspect: 16 / 9,
  baseWidth: 1600
};

Debut.Animation = Animation;
Debut.animations = Animation.animations;

export default Debut;
