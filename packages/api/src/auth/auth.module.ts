import { Module } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users.service';
import { AuthController } from '../auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy'; // Import GoogleStrategy
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({ // Use registerAsync to inject ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Use JWT_SECRET from .env
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService], // Inject ConfigService
    }),
  ],
  providers: [
    AuthService,
    UsersService,
    PrismaService,
    JwtStrategy,
    GoogleStrategy, // Add GoogleStrategy
  ],
  controllers: [AuthController],
})
export class AuthModule {}
