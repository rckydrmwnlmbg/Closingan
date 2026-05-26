import { Logger } from '@nestjs/common';
const logger = new Logger('Test');
logger.log({ msg: 'Hello', tenantId: '123' });
