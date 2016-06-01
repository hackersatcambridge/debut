import Action from './Action';
import ActionQueue from './ActionQueue';
import Presentation from './Presentation';

const debut = function debut(element, options) {
  return new Presentation(element, options);
};

debut.Action = Action;
debut.ActionQueue = ActionQueue;
debut.Presentation = Presentation;

export default debut;
