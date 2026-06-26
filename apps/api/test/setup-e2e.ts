const RedisMock = require('ioredis-mock');
jest.mock('ioredis', () => ({ Redis: RedisMock, default: RedisMock }));

const { setMaxListeners } = require('events');
setMaxListeners(100);

afterAll(() => {
    // Attempt global cleanup to prevent memory leaks in Jest
    if (global.gc) {
      global.gc();
    }
});
