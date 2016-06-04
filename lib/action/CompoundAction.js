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

  setupAction() {
    // Make sure all groups are sorted by delay order
    this.actions.forEach((action) => action.sort((a, b) => a.delay - b.delay));
  }

  performAction(reverse, instant, groupIndex = 0) {
    // TODO: Make this work in reverse
    if (this.actions.length < groupIndex + 1) {
      return null;
    }

    const actionGroup = this.actions[groupIndex];
    return Promise.all(
      actionGroup.map(a => a.run(reverse, instant))
    ).then(() => this.performAction(reverse, instant, groupIndex + 1));
  }

  addAnd(action) {
    this.actions[this.actions.length - 1].push(action);
  }

  addThen(action) {
    this.actions.push([action]);
  }
}

export default CompoundAction;
