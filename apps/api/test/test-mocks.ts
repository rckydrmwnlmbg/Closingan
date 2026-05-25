export const mockQueue = {
  add: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  obliterate: jest.fn(),
  drain: jest.fn(),
  getJob: jest.fn(),
  getJobs: jest.fn().mockResolvedValue([]),
  close: jest.fn(),
  disconnect: jest.fn(),
};

export const MockWorker = {
  process: jest.fn(),
  close: jest.fn(),
  disconnect: jest.fn(),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
};

export const mockOpenAiService = {
  generateReply: jest.fn().mockResolvedValue('Mocked response'),
  analyzeLead: jest.fn().mockResolvedValue({ isHot: true }),
};
