import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, comparePassword } from './auth/password.utils';
import { RegisterUserDto } from './auth/dto/register-user.dto';
import { PrismaService } from './prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && user.passwordHash && (await comparePassword(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    const userRefreshTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
    });

    const matchingToken = await this.findMatchingToken(refreshToken, userRefreshTokens);

    if (!matchingToken) {
      throw new ForbiddenException('Access Denied');
    }

    // Token rotation: Invalidate the used token and issue a new one.
    await this.prisma.refreshToken.update({
      where: { id: matchingToken.id },
      data: { revokedAt: new Date() },
    });

    const newRefreshToken = await this.createRefreshToken(user.id);
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken: newRefreshToken.token,
    };
  }

    private async findMatchingToken(token: string, userTokens: RefreshToken[]) {
    for (const userToken of userTokens) {
      if (await bcrypt.compare(token, userToken.token)) {
        return userToken;
      }
    }
    return null;
  }

  async createRefreshToken(userId: string): Promise<{ token: string }> {
    const token = uuidv4();
    const hashedToken = await bcrypt.hash(token, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Refresh token expires in 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });

    return { token };
  }

  async register(registerUserDto: RegisterUserDto) {
    const existingUser = await this.usersService.findOne(registerUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await hashPassword(registerUserDto.password);
    const newUser = await this.usersService.create({
      email: registerUserDto.email,
      passwordHash: hashedPassword,
    });

    // Exclude password from the returned user object
    const { passwordHash, ...result } = newUser;
    return result;
  }

  async validateOAuthLogin(
    email: string,
    firstName: string,
    lastName: string,
    provider: string,
    providerId: string,
  ): Promise<any> {
    try {
      let user = await this.usersService.findOne(email);

      if (!user) {
        // If user does not exist, create a new one
        user = await this.usersService.create({
          email,
          name: `${firstName} ${lastName}`,
          provider,
          providerId,
          // passwordHash is optional for OAuth users
        });
      } else if (user.provider !== provider || user.providerId !== providerId) {
        if (user.provider === 'local' && !user.providerId) {
          user = await this.usersService.update(user.id, {
            provider,
            providerId,
          });
        } else {
          throw new UnauthorizedException(
            `Account already exists with ${user.provider} provider.`,
          );
        }
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('OAuth login failed.', error.message);
    }
  }
}

