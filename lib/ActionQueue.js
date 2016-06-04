import Action from './Action';

/**
 * Manages the inerpretation and running of a series of Action objects
 */
class ActionQueue {
  constructor() {
    this.queue = [];
    this.queueIndex = 0;
    this.isRunning = false;
  }

  addAction(a) {
    this.queue.push(a);
  }

  proceed(reverse = false, instant = false) {
    if (this.isRunning) {
      throw new Error('Cannot run action while queue is running');
    }

    const direction = reverse ? -1 : 1;
    const newIndex = this.queueIndex + direction;

    if (newIndex < 0 || newIndex > this.queue.length) {
      throw new Error('Action queue index out of bounds');
    }

    // If we are reversed, we want to replay the previous action in reverse
    // If not, we want to play the next animation
    const actionToRun = this.queue[this.queueIndex + (reverse ? -1 : 0)];

    const oldIndex = this.queueIndex;
    this.isRunning = true;
    this.queueIndex = newIndex;

    return Promise.resolve(actionToRun.run(reverse, instant))
      .then(() => {
        this.isRunning = false;
      })
      .catch(() => {
        // Action has rejected, back up
        this.isRunning = false;
        this.queueIndex = oldIndex;
      });
  }

  /**
   * Goes to a particular state in the action queue
   */
  goTo(index) {
    if (index < 0 || index > this.queue.length) {
      throw new Error('Action queue index out of bounds');
    }

    if (this.queueIndex === index) {
      return Promise.resolve();
    }

    const reverse = index < this.queueIndex;

    return this.proceed(reverse, true)
      .then(() => this.goTo(index));
  }
}

export default ActionQueue;
