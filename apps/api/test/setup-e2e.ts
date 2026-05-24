import 'reflect-metadata';
const RedisMock = require('ioredis-mock');
jest.mock('ioredis', () => ({ Redis: RedisMock, default: RedisMock }));

// Mock bullmq
jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      obliterate: jest.fn(),
      drain: jest.fn(),
      getJob: jest.fn(),
      getJobs: jest.fn().mockResolvedValue([]),
      close: jest.fn(),
      disconnect: jest.fn(),
    })),
    Worker: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      close: jest.fn(),
      disconnect: jest.fn(),
      waitUntilReady: jest.fn(),
    })),
    QueueEvents: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      close: jest.fn(),
      disconnect: jest.fn(),
    })),
    FlowProducer: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      addBulk: jest.fn(),
      close: jest.fn(),
      disconnect: jest.fn(),
    })),
  };
});
