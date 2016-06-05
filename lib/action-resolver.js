import CompoundAction from './action/CompoundAction';


/**
 * Module for resolving strings and functions into actions
 * Strings will resolve to class names
 * Functions will resolve to simple actions
 * All other objects will be assumed to be actions
 */


/**
 * Mapping of strings to action classes that we want resolvable
 * Note: This does not include all subclasses of action because some aren't
 * useful in a presentation setting
 * @type {Object}
 */
const actionClasses = {

};

export function resolveAction(action, actor, options) {
  if (Array.isArray(actor)) {
    // Actor is actually an array
    // We assume it is an array of actors
    // And create an action for each
    const compoundAction = new CompoundAction();
    compoundAction.addGroup(
      actor.map((a) => resolveAction(action, a, options))
    );

    return compoundAction;
  }

  const resolvedOptions = Object.assign({ actor }, options);

  if (typeof action === 'string') {
    if (action in actionClasses) {
      return new actionClasses[action](resolvedOptions);
    }

    throw new Error(`Could not resolve action: ${action}`);
  }

  if (typeof action === 'function') {
    // TODO: Implement function resolution
    // By creating a new action with its `performAction` as this function
    throw new Error('Function resolution for actions not implemented');
  }

  // Otherwise, we assume that the object is an action
  return action;
}
