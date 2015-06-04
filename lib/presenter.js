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
    var checkKeys = function (keys, e, fn) {
      var self = this;
      this.debut.options.keys[keys].forEach(function (key) {
        if (e.which === key) {
          fn.call(self);
        }
      });
    }.bind(this);

    this.$.window.keyup(function (e) {
      checkKeys('next', e, debut.next.bind(debut));
      checkKeys('prev', e, debut.prev.bind(debut));
    }.bind(this));
  }
};

/**
 * Adds milestones to the navigation
 *
 * @private
 */
PresenterView.prototype._addMilestones = function addMilestones() {
  console.log('Add milestones', this.debut.milestones);
  this.debut.milestones.forEach(function (milestone) {
    console.log(milestone);
    var element = $('<button class="debut-button debut-milestone">' + milestone.name + '</div>');

    element.click(function () {
      this.debut.goTo(milestone.index);
    }.bind(this));

    this.$.milestones.append(element);
  }.bind(this));
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

export default PresenterView;
