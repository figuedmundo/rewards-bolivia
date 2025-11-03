import { Queue } from 'bullmq';
import { queueConfig } from './queue.config';
import { JobNames } from '../types/job.types';

export class ReconciliationQueue extends Queue {
  constructor() {
    super(JobNames.RECONCILIATION, queueConfig);
  }

  async addReconciliationJob(data: any, options?: any) {
    return this.add(JobNames.RECONCILIATION, data, {
      ...queueConfig.defaultJobOptions,
      ...options,
    });
  }
}

export const reconciliationQueue = new ReconciliationQueue();