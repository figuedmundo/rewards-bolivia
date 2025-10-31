import { Module } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users.service';
import { AuthController } from '../auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      global: true, // Make JWT services available globally
      secret: 'HARDCODED_SECRET_REPLACE_WITH_ENV_VAR', // TODO: Move to .env
      signOptions: { expiresIn: '15m' }, // Access token expiration
    }),
  ],
  providers: [AuthService, UsersService, PrismaService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
