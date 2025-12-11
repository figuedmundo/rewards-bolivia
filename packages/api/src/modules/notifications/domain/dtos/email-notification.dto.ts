import { IsString, IsEmail } from 'class-validator';

export class EmailNotificationDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  htmlBody: string;

  @IsString()
  textBody: string;
}
