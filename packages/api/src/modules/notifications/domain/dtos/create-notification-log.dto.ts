import { IsString, IsEnum, IsInt, IsDate, IsOptional } from 'class-validator';
import { NotificationType, NotificationStatus } from '../entities/notification-log.entity';

export class CreateNotificationLogDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  notificationType: NotificationType;

  @IsEnum(NotificationStatus)
  status: NotificationStatus;

  @IsDate()
  @IsOptional()
  sentAt?: Date | null;

  @IsString()
  @IsOptional()
  failureReason?: string | null;

  @IsDate()
  expirationDate: Date;

  @IsInt()
  pointsExpiring: number;
}
