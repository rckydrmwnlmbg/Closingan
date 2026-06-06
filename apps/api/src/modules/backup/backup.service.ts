import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import * as util from 'util';
import * as path from 'path';

const execAsync = util.promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCron() {
    this.logger.log('Starting daily database backup job...');

    // Assuming the script is at the root of the project (../../../../../scripts/db-backup.sh from this file in dist/apps/api/src/modules/backup)
    // A safer path resolution for monorepo is to use process.cwd() knowing where the root is
    const scriptPath = path.resolve(
      process.cwd(),
      '../../scripts/db-backup.sh',
    );

    try {
      // Execute the bash script
      const { stdout, stderr } = await execAsync(`bash ${scriptPath}`);

      if (stdout) {
        this.logger.log(`Backup stdout: ${stdout}`);
      }

      if (stderr) {
        this.logger.warn(`Backup stderr: ${stderr}`);
      }

      this.logger.log('Daily database backup job completed successfully.');
    } catch (error) {
      this.logger.error('Daily database backup job failed', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }
}
