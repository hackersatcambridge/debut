var $ = jQuery;

/**
 * Class to handle opening and events in the presenter view.
 * Uses haxe to allow it to run in another window
 *
 * @constructor
 */
var PresenterView = function PresenterView(element, win, doc) {
  console.log('I\'m here');
  if (typeof win === 'undefined') {
    win = window;
  }

  if (typeof doc === 'undefined') {
    doc = win.document;
  }

  this.elements = {
    container: element,
    window: win,
    document: doc
  };

  this.$ = {
    container: $(element),
    window: $(win),
    document: $(doc)
  };

  this.$.document.find('.debut-button-nav').click(function () {
  });
};

export default PresenterView;
