describe('DomIterator', () => {
  const html = `
<div class="e1">
  <div></div>
  <div></div>
  <div class="e2"></div>
</div>
<div class="e3">
  <div>
    <div>
      <div class="e4"></div>
      <div></div>
    </div>
    <div>
      <div></div>
    </div>
  </div>
  <div></div>
</div>
<div class="e5"></div>`;

  const checkStates = (parent, spec) => {
    spec.forEach((c, i) => {
      if (i === 0) {
        expect(parent.getAttribute('data-state')).toBe(c);
        return;
      }

      expect(parent.querySelector(`.e${i}`).getAttribute('data-state')).toBe(c);
    });
  };

  const parent = document.createElement('div');
  parent.innerHTML = html;

  const iterator = new debut.DomIterator(parent, (el, type) => {
    el.setAttribute('data-state', type);
  });

  it('should not modify elements on creation', () => {
    checkStates(parent, [null, null, null, null, null, null]);
  });

  it('should work in simple cases', () => {
    iterator.gotoElement(parent.querySelector('.e1'));
    checkStates(parent, ['enter', null, null, null, null, null]);
    iterator.gotoElement(parent.querySelector('.e2'));
    checkStates(parent, ['enter', 'enter', null, null, null, null]);
    iterator.gotoElement(parent.querySelector('.e3'));
    checkStates(parent, ['enter', 'exit', 'exit', null, null, null]);
  });

  it('should not change when going backwards', () => {
    iterator.gotoElement(parent.querySelector('.e1'));
    checkStates(parent, ['enter', 'exit', 'exit', null, null, null]);
  });

  it('should work with complicated nesting', () => {
    iterator.gotoElement(parent.querySelector('.e4'));
    checkStates(parent, ['enter', 'exit', 'exit', 'enter', null, null]);
    iterator.gotoElement(parent.querySelector('.e5'));
    checkStates(parent, ['enter', 'exit', 'exit', 'exit', 'exit', null]);
  });

  it('should complete successfully', () => {
    iterator.complete();
    checkStates(parent, ['exit', 'exit', 'exit', 'exit', 'exit', 'exit']);
  });
});
