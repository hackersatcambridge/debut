var $ = jQuery;

var animations = { };

/**
 * The appear animation is the most simple. All it does is make the element appear.
 * The logic is empty because animations naturally handle hiding and showing entrance animations.
 */
animations.appear = function (context, callback) {
  setTimeout(callback.bind(this), this.duration);
};

animations.appear.beforeState = function beforeState(context) {

};

animations.appear.defaultOptions = {
  entrance: true,
  duration: 0
};

export default animations;
