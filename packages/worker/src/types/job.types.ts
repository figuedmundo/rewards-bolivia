export interface ReconciliationJobData {
  userId: string;
  transactionId?: string;
  consolidationType: 'daily' | 'weekly' | 'manual';
  correlationId: string;
}

export interface JobResult {
  success: boolean;
  message: string;
  data?: any;
}

export enum JobNames {
  RECONCILIATION = 'reconciliation',
  CONSOLIDATION = 'consolidation',
  AUDIT = 'audit'
}