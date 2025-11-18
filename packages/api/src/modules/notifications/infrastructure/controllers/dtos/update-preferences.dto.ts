import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiProperty({
    type: Boolean,
    description: 'Whether the user wants to receive email notifications about expiring points',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  emailNotifications: boolean;
}
