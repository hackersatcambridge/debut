var $ = jQuery;

var animations = { };

/**
 * The appear animation is the most simple. All it does is make the element appear.
 * The logic is empty because animations naturally handle hiding and showing entrance animations.
 */
animations.appear = function (context, callback) {
  setTimeout(callback.bind(this), context.duration);
};

animations.appear.beforeState = function beforeState(context) {

};

animations.appear.defaultOptions = {
  entrance: true,
  duration: 0
};

/**
 * Slides the element in from a side of the screen
 */
animations.slide = function slide(context, callback) {
  this.$element.transit({
    x: '+=' + (-context.direction * this.store.leftShift),
    y: '+=' + (-context.direction * this.store.topShift)
  }, context.duration, this.options.easing, callback);
};

animations.slide.prepare = function prepare(context) {
  var leftShift = 0;
  var topShift = 0;

  if (context.direction === 1) {
    this.$element.css({
      x: this.store.x,
      y: this.store.y
    });
  }

  var position = context.debut.offset(this.$element);

  switch (this.options.from) {
    default:
    case 'left':
      leftShift = -(this.$element.width() + position.left);
      break;
    case 'right':
      leftShift = context.debut.bounds.visibleWidth - position.left;
      break;
    case 'top':
      topShift = -(this.$element.height() + position.top);
      break;
    case 'bottom':
      topShift = context.debut.bounds.visibleHeight - position.top;
      break;
  }

  if (context.direction === 1) {
    this.$element.css({
      x: '+=' + (context.direction * leftShift),
      y: '+=' + (context.direction * topShift)
    });
  }

  this.store.leftShift = leftShift;
  this.store.topShift = topShift;
};

animations.slide.beforeState = function beforeState(context) {
  this.store.x = this.$element.css('x');
  this.store.y = this.$element.css('y');
};

animations.slide.defaultOptions = {
  entrance: true,
  from: 'left'
};

/**
 * Allows you to arbitrarily animate css using css transitions
 *
 * Uses Transit internally, so look to their documentation
 *
 * TODO: Keep track of multiple elements if necessary
 */
animations.animatecss = function animatecss(context, callback) {
  var toGo = context.reversed ? this.store.props : this.options.props;

  this.$element.transit(toGo, context.duration, this.options.easing, callback);
};

animations.animatecss.beforeState = function beforeState(context) {
  this.store.props = {};
  for (var key in this.options.props) {
    this.store.props[key] = this.$element.css(key);
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
  var toGo = context.reversed ? this.store.props : this.options.props;

  this.$element.animate(toGo, context.duration, this.options.easing, callback);
};

animations.animate.beforeState = function beforeState(context) {
  this.store.props = {};
  for (var key in this.options.props) {
    this.store.props[key] = this.$element.attr(key);
  }
};

animations.animate.defaultOptions = {
  easing: 'swing'
};

export default animations;
