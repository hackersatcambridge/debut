describe('Action', () => {
  // Simple action
  class MyAction extends debut.Action {
    constructor() {
      super();
      this.a = 0;
      this.b = 0;
    }

    performAction(reverse) {
      this.a = reverse ? 0 : 1;
    }

    setupAction() {
      this.b += 1;
    }
  }

  const action1 = new MyAction();

  it('should be able to run', () => {
    expect(action1.a).toBe(0);
    expect(action1.b).toBe(0);
    return action1.run().then(() => {
      expect(action1.a).toBe(1);
      expect(action1.b).toBe(1);
    });
  });

  it('should run in reverse', () => {
    action1.run(true).then(() => {
      expect(action1.a).toBe(0);
      expect(action1.b).toBe(1);
    });
  });
});
