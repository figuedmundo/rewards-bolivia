import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from 'eventemitter2';
import { TransactionEventPublisher } from './transaction-event.publisher';
import { TransactionCompletedEvent } from '../../domain/events/transaction-completed.event';
import { TransactionType } from '@prisma/client';

describe('TransactionEventPublisher', () => {
  let publisher: TransactionEventPublisher;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionEventPublisher,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    publisher = module.get<TransactionEventPublisher>(
      TransactionEventPublisher,
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(publisher).toBeDefined();
  });

  it('should emit a transaction.completed event', () => {
    const mockTransaction: any = {
      id: 'tx1',
      type: TransactionType.EARN,
      pointsAmount: 100,
      status: 'COMPLETED',
      businessId: 'biz1',
      customerId: 'cust1',
    };
    const event: TransactionCompletedEvent = { transaction: mockTransaction };

    publisher.publishTransactionCompleted(event);

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'transaction.completed',
      event,
    );
  });
});
