import Action from './Action.js';

/**
 * Represents a group of actions that are always to be run together
 */
class CompoundAction extends Action {
  constructor() {
    super();
    // Actions are stored as an array of arrays
    // Larger arrays have to be run one after the other
    // Inner arrays are run together
    this.actions = [[]];
  }

  performAction(reverse, instant, groupIndex = 0) {
    if (this.actions.length < groupIndex + 1) {
      return null;
    }

    let actionGroup = this.actions[groupIndex];
    const actionPromises = actionGroup.map(() => null);

    // Deal with delays in reverse
    if (reverse) {
      // Clone action array and sort by total length (descending)
      actionGroup = [...actionGroup];
      actionGroup.sort((a, b) => (b.duration + b.delay) - (a.duration + a.delay));
      const maxLength = actionGroup.reduce((action, max) =>
        Math.max(max, action.delay + action.duration)
      );

      actionGroup.forEach((action, i) => {
        const delay = instant ? 0 : maxLength - (action.delay + action.duration);
        actionPromises[i] = new Promise(
          (resolve) => setTimeout(resolve, delay)
        );
      });
    }

    actionPromises.forEach((action, index) => {
      actionPromises[index] = Promise.resolve(actionPromises[index])
        .then(() => actionGroup[index].run(reverse, instant));
    });

    return Promise.all(actionPromises)
      .then(() => this.performAction(reverse, instant, groupIndex + 1));
  }

  addAnd(action) {
    this.actions[this.actions.length - 1].push(action);
  }

  addThen(action) {
    this.actions.push([action]);
  }
}

export default CompoundAction;
