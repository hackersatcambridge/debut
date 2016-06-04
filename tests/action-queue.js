describe('ActionQueue', () => {
  let a = 0;
  let b = 0;

  class MyAction extends debut.Action {
    constructor() {
      super();
      this.a = 0;
      this.b = 0;
    }

    performAction(reverse) {
      a += reverse ? -1 : 1;
    }

    setupAction() {
      b += 1;
    }
  }

  const action1 = new MyAction();
  const action2 = new MyAction();
  const actionQueue = new debut.ActionQueue();

  actionQueue.addAction(action1);
  actionQueue.addAction(action2);

  it('should allow proceeding', () => actionQueue.proceed()
    .then(() => {
      expect(a).toBe(1);
      expect(b).toBe(1);
    })
  );

  it('should allow proceeding twice', () => actionQueue.proceed()
    .then(() => {
      expect(a).toBe(2);
      expect(b).toBe(2);
    })
  );

  it('should allow proceeding in reverse', () => actionQueue.proceed(true)
    .then(() => {
      expect(b).toBe(2);
    })
  );

  it('should allow skipping', () => actionQueue.goTo(2)
    .then(() => {
      expect(a).toBe(2);
    })
  );

  it('should allow skipping in reverse', () => actionQueue.goTo(0)
    .then(() => {
      expect(a).toBe(0);
    })
  );
});
