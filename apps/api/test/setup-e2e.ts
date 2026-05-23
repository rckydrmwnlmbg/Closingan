const RedisMock = require('ioredis-mock'); jest.mock('ioredis', () => ({ Redis: RedisMock, default: RedisMock }));
