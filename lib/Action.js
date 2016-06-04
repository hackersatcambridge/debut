/**
 * Represents an individual action with a concept of direction and completion
 */
class Action {
  constructor({ actor = undefined, options = { } } = { }) {
    this.hasRun = false;
    this.actor = actor;
    this.options = this.setupOptions(options);
    this.duration = options.duration || 0;
  }

  /**
   * Runs the action
   * Don't override this
   */
  run(reverse = false) {
    if (!this.hasRun) {
      this.setupAction();
      this.hasRun = true;
    }

    return this.performAction(reverse);
  }

  performAction(reverse) {
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
    return Object.assign({ duration: 0 }, options);
  }
}

export default Action;
