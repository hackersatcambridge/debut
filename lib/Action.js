/**
 * Represents an individual action with a concept of direction and completion
 */
class Action {
  constructor() {
    this.hasRun = false;
  }

  /**
   * Runs the action
   */
  run(reverse = false) {
    if (!this.hasRun) {
      this.beforeRun();
      this.hasRun = false;
    }
  }

  /**
   * Sets up the action. Called before the first time the action is run
   */
  beforeRun() {
  }
}

export default Action;
