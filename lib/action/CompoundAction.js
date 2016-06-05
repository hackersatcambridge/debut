import Action from './Action.js';

/**
 * Comparison function for sorting action groups
 * in descending order of total length.
 * Preserves reverse original order in the event of a tie
 * This makes all sorts stable
 */
function compareActions(a, b, originalGroup) {
  const order = (b.delay + b.duration) - (a.delay + a.duration);

  if (order === 0) {
    // Original order (reversed)
    // TODO: Optimise linear search
    return originalGroup.indexOf(b) - originalGroup.indexOf(a);
  }

  return order;
}

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

  performAction(reverse, instant) {
    const startIndex = reverse ? this.actions.length - 1 : 0;
    this.runActionGroup(reverse, instant, startIndex);
  }

  runActionGroup(reverse, instant, groupIndex) {
    if ((groupIndex > this.actions.length - 1) || (groupIndex < 0)) {
      return null;
    }

    let actionGroup = this.actions[groupIndex];
    const actionPromises = actionGroup.map(() => null);

    // Deal with delays in reverse
    if (reverse) {
      // Clone action array and sort by total length (descending)
      // Maintaining original order in the event of a conflict
      const originalGroup = actionGroup;
      actionGroup = [...actionGroup];
      actionGroup.sort((a, b) => compareActions(a, b, originalGroup));
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
