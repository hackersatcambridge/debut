import ActionQueue from './ActionQueue';
import CompoundAction from './action/CompoundAction';

/**
 * The DOM implementation of an ActionQueue
 */
class Presentation {
  constructor(element, options = { }) {
    let resolvedElement = element;
    if (typeof element === 'string') {
      resolvedElement = document.querySelector(element);
    }

    if (!(resolvedElement instanceof Element)) {
      throw new Error('element parameter must resolve to a DOM element');
    }

    this.element = resolvedElement;
    this.options = this.setupOptions(options);
    this.actionQueue = new ActionQueue();
  }

  step(action, actor = null, options = { }) {
    // TODO: add action resolution
    const resolvedAction = action;

    if ((options.type === 'and') || (options.type === 'then')) {
      // Wrap these actions up in a CompoundAction
      let lastAction = this.actionQueue.getLastAction();
      if (lastAction === null) {
        throw new Error('A `step` action must be added before compound actions');
      }

      if (!(lastAction instanceof CompoundAction)) {
        this.actionQueue.removeLastAction();
        const actionToInsert = lastAction;
        lastAction = new CompoundAction();
        lastAction.addThen(actionToInsert);
      }

      if (options.type === 'and') {
        lastAction.addAnd(resolvedAction);
      } else {
        lastAction.addThen(resolvedAction);
      }
    }

    return this;
  }

  and(action, actor = null, options = { }) {
    return this.step(action, actor, Object.assign({ type: 'and' }, options));
  }

  then(action, actor = null, options = { }) {
    return this.step(action, actor, Object.assign({ type: 'then' }, options));
  }

  proceed(reverse = false) {
    return this.actionQueue.proceed(reverse);
  }

  goTo(index) {
    return this.actionQueue.goTo(index);
  }

  setupOptions(options) {
    return Object.assign({ }, options);
  }
}

export default Presentation;
