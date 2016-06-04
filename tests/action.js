describe('actions', () => {
  // Simple action
  class MyAction extends debut.Action {
    constructor() {
      super();
      this.a = 0;
      this.b = 0;
    }

    run(reverse) {
      super.run();
      this.a = reverse ? 0 : 1;
    }

    beforeRun() {
      this.b += 1;
    }
  }

  const action1 = new MyAction();

  it('should be able to run', () => {
    expect(action1.a).toBe(0);
    expect(action1.b).toBe(0);
    action1.run();
    expect(action1.a).toBe(1);
    expect(action1.b).toBe(1);
  });

  it('should run in reverse', () => {
    action1.run(true);
    expect(action1.a).toBe(0);
    expect(action1.b).toBe(1);
  });
});

describe('ActionQueue', () => {
  let a = 0;
  let b = 0;

  class MyAction extends debut.Action {
    constructor() {
      super();
      this.a = 0;
      this.b = 0;
    }

    run(reverse) {
      super.run();
      a += reverse ? -1 : 1;
    }

    beforeRun() {
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
});
