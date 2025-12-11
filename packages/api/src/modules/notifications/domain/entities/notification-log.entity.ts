export enum NotificationType {
  EXPIRATION_30_DAYS = 'EXPIRATION_30_DAYS',
  EXPIRATION_7_DAYS = 'EXPIRATION_7_DAYS',
  EXPIRATION_1_DAY = 'EXPIRATION_1_DAY',
}

export enum NotificationStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export class NotificationLog {
  id: string;
  userId: string;
  notificationType: NotificationType;
  status: NotificationStatus;
  sentAt: Date | null;
  failureReason: string | null;
  expirationDate: Date;
  pointsExpiring: number;
  createdAt: Date;

  constructor(data: {
    id: string;
    userId: string;
    notificationType: NotificationType;
    status: NotificationStatus;
    sentAt: Date | null;
    failureReason: string | null;
    expirationDate: Date;
    pointsExpiring: number;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.notificationType = data.notificationType;
    this.status = data.status;
    this.sentAt = data.sentAt;
    this.failureReason = data.failureReason;
    this.expirationDate = data.expirationDate;
    this.pointsExpiring = data.pointsExpiring;
    this.createdAt = data.createdAt;
  }
}
