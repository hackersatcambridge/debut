/**
 * Steps over elements in the DOM in order
 * Can be staggered so as to only step to a new element as required
 * TODO: Fix edge case where "currentElement" is removed from the container
 */
class DomIterator {
  constructor(element) {
    this.container = element;
    this.currentElement = this.container;
    this.completed = false;
  }

  gotoElement(target) {
    if (this.completed) {
      return;
    }

    if (!(target instanceof Element)) {
      return;
    }

    if (!this.container.contains(target)) {
      return;
    }

    // TODO: Optimise by comparing relative indicies through walking up
    // the DOM from the elements - reduces memory and time complexity radically
    const allChildren = this.container.querySelectorAll('*');
    const currentIndex = allChildren.indexOf(this.currentElement);
    const targetIndex = allChildren.indexOf(target);

    if (currentIndex >= targetIndex) {
      // Target element is before the element we have already reached
      return;
    }

    // Checks have passed, start iterating
    this.enterElement(target);
  }

  complete() {
    if (this.completed) {
      return;
    }

    this.enterElement(null);
    this.completed = true;
  }

  /**
   * @private
   */
  enterElement(target) {
    const el = this.currentElement;

    if (el === target) {
      // We have reached the target, terminate
      return;
    }

    this.elementFound(el, 'enter');

    if (el.childElementCount === 0) {
      // No children, go directly to exit
      this.exitElement(target);
      return;
    }

    // Enter child element;
    this.currentElement = el.children[0];
    this.enterElement(target);
  }

  /**
   * @private
   */
  exitElement(target) {
    const el = this.currentElement;
    this.elementFound(el, 'exit');

    if (el === this.container) {
      return;
    }

    const sibling = el.nextElementSibling;

    if (sibling != null) {
      this.currentElement = sibling;
      this.enterElement(target);
    }

    // There's no sibling, we need to exit the parent
    this.currentElement = el.parentElement;
    this.exitElement(target);
  }

  elementFound(el, type) {
    // TODO: Emit some kind of event
  }
}

export default DomIterator;
