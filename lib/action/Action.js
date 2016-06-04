/**
 * Represents an individual action with a concept of direction and completion
 */
class Action {
  constructor({ actor = undefined, options = { } } = { }) {
    this.hasRun = false;
    this.actor = actor;
    this.options = this.setupOptions(options);
    this.duration = options.duration || 0;
    this.delay = options.delay || 0;
  }

  /**
   * Runs the action
   * Don't override this
   * @param reverse - whether to run this in reverse or not
   * @param instant - if this action should be completed instantly
   */
  run(reverse = false, instant = false) {
    if (!this.hasRun) {
      this.setupAction();
      this.hasRun = true;
    }

    // TODO: make beforeAction nonsense cleaner
    let p = null;

    if (!reverse) {
      p = this.beforeAction(reverse, instant);
    }

    p = Promise.resolve(p)
      .then(() => this.performAction(reverse, instant));

    if (reverse) {
      p.then(() => this.beforeAction(reverse, instant));
    }
  }

  beforeAction(reverse, instant) {
    if ((this.delay === 0) || (instant)) {
      return null;
    }

    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  performAction(reverse, instant) {
  }

  /**
   * Sets up the action. Called before the first time the action is run
   */
  setupAction() {
  }

  /**
   * Manipulates a set of options when the action is first created
   * Useful for setting defaults
   */
  setupOptions(options) {
    return Object.assign({ }, options);
  }
}

export default Action;
