import 'dotenv/config';
import { createReconciliationWorker } from './jobs/reconciliation.processor';
import { LoggerService } from '@rewards-bolivia/logger';

const logger = new LoggerService('WorkerMain');

async function startWorker() {
  try {
    logger.log('Starting Rewards Bolivia Worker...');

    // Initialize workers
    const reconciliationWorker = createReconciliationWorker();

    logger.log('Worker initialized successfully');

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.log('Received SIGTERM, shutting down gracefully...');
      await reconciliationWorker.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('Received SIGINT, shutting down gracefully...');
      await reconciliationWorker.close();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start worker', { error: error.message });
    process.exit(1);
  }
}

startWorker();