var $ = jQuery;

var animations = { };

/**
 * The appear animation is the most simple. All it does is make the element appear
 */
animations.appear = function (context, callback) {
  if (context.direction === 1) {
    this.element.css('visibility', '');
  } else {
    this.element.css('visibility', this.beforeState.visibility);
  }
};

animations.appear.beforeState = function beforeState(context) {
  this.beforeState.visibility = this.element.css('visibility');
};

animations.appear.defaultOptions = {
  entrance: true
}

export default animations;
