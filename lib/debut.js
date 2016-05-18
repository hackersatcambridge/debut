import Action from './Action';
import ActionScheduler from './ActionScheduler';
import Presentation from './Presentation';

const debut = function debut(element, options) {
  return new Presentation(element, options);
};

debut.Action = Action;
debut.ActionScheduler = ActionScheduler;
debut.Presentation = Presentation;

export default debut;
