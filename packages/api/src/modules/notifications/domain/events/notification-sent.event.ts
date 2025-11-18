import { NotificationStatus, NotificationType } from '../entities/notification-log.entity';

export interface NotificationSentEvent {
  userId: string;
  notificationType: NotificationType;
  status: NotificationStatus;
  timestamp: Date;
  pointsExpiring: number;
  expirationDate: Date;
}
