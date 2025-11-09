import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    example: 'clx000000000000000000000',
    description: 'Unique identifier of the user',
  })
  id!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  name!: string;

  @ApiProperty({
    example: 'client',
    description: 'Role of the user (client, business, admin)',
  })
  role!: string;

  @ApiProperty({
    example: 1000,
    description: 'Current points balance of the user',
  })
  pointsBalance!: number;

  @ApiProperty({
    example: '2023-01-01T12:00:00.000Z',
    description: 'Date and time when the user was created',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2023-01-01T12:00:00.000Z',
    description: 'Date and time when the user was last updated',
  })
  updatedAt!: Date;
}
