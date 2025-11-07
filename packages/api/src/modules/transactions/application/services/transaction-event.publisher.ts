import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { TransactionCompletedEvent } from '../../domain/events/transaction-completed.event';

@Injectable()
export class TransactionEventPublisher {
  constructor(private eventEmitter: EventEmitter2) {}

  publishTransactionCompleted(event: TransactionCompletedEvent) {
    this.eventEmitter.emit('transaction.completed', event);
  }
}
