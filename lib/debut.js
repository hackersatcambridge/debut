import Action from './action/Action';
import ActionQueue from './ActionQueue';
import Presentation from './Presentation';
import DomIterator from './DomIterator';

const debut = function debut(element, options) {
  return new Presentation(element, options);
};

debut.Action = Action;
debut.ActionQueue = ActionQueue;
debut.Presentation = Presentation;
debut.DomIterator = DomIterator;

export default debut;
