import RedisMock from 'ioredis-mock';
import { setMaxListeners } from 'events';

jest.mock('ioredis', () => ({ Redis: RedisMock, default: RedisMock }));

setMaxListeners(100);

afterAll(() => {
  // Attempt global cleanup to prevent memory leaks in Jest
  if (typeof gc !== 'undefined') {
    gc();
  }
});
