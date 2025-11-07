import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthModule } from './auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOneById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockPrismaService = {
    refreshToken: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'test-secret',
              GOOGLE_CLIENT_ID: 'test-client-id',
              GOOGLE_CLIENT_SECRET: 'test-client-secret',
              GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback',
            }),
          ],
        }),
      ],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const user = { id: '1', email: 'test@test.com' };
      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';

      mockJwtService.sign.mockReturnValue(accessToken);
      jest
        .spyOn(service, 'createRefreshToken')
        .mockResolvedValue({ token: refreshToken });

      const result = await service.login(user as any);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
      expect(service.createRefreshToken).toHaveBeenCalledWith(user.id);
      expect(result).toEqual({ accessToken, refreshToken });
    });
  });

  describe('logout', () => {
    it('should revoke all refresh tokens for a user', async () => {
      const userId = '1';
      await service.logout(userId);
      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId, revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('refreshTokens', () => {
    const userId = '1';
    const refreshToken = 'valid_refresh_token';
    const user = { id: userId, email: 'test@test.com' };

    it('should throw ForbiddenException if user not found', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if no matching token found', async () => {
      mockUsersService.findOneById.mockResolvedValue(user);
      mockPrismaService.refreshToken.findMany.mockResolvedValue([]);
      jest.spyOn(service as any, 'findMatchingToken').mockResolvedValue(null);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return new tokens and revoke the old one', async () => {
      const oldTokenRecord = { id: 'tokenId', token: 'hashed_token' };
      const newAccessToken = 'new_access_token';
      const newRefreshToken = { token: 'new_refresh_token' };

      mockUsersService.findOneById.mockResolvedValue(user);
      mockPrismaService.refreshToken.findMany.mockResolvedValue([
        oldTokenRecord,
      ]);
      jest
        .spyOn(service as any, 'findMatchingToken')
        .mockResolvedValue(oldTokenRecord);
      mockPrismaService.refreshToken.update.mockResolvedValue({} as any);
      jest
        .spyOn(service, 'createRefreshToken')
        .mockResolvedValue(newRefreshToken);
      mockJwtService.sign.mockReturnValue(newAccessToken);

      const result = await service.refreshTokens(userId, refreshToken);

      expect(mockPrismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: oldTokenRecord.id },
        data: { revokedAt: expect.any(Date) },
      });
      expect(service.createRefreshToken).toHaveBeenCalledWith(userId);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken.token,
      });
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const dto = {
        email: 'new@user.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };
      mockUsersService.findOne.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 'new-id',
        email: dto.email,
        passwordHash: 'hashed_password',
      });

      const result = await service.register(dto as any);

      expect(usersService.findOne).toHaveBeenCalledWith(dto.email);
      expect(usersService.create).toHaveBeenCalledWith({
        email: dto.email,
        passwordHash: expect.any(String),
        name: `${dto.firstName} ${dto.lastName}`,
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe(dto.email);
    });

    it('should throw ConflictException if email is already registered', async () => {
      const dto = {
        email: 'existing@user.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };
      mockUsersService.findOne.mockResolvedValue({ id: '1', email: dto.email });

      await expect(service.register(dto as any)).rejects.toThrow(
        new ConflictException('Email already registered'),
      );
    });
  });

  describe('validateOAuthLogin', () => {
    const oauthProfile = {
      email: 'oauth@user.com',
      firstName: 'Test',
      lastName: 'User',
      provider: 'google',
      providerId: 'google-123',
    };

    it('should create a new user if one does not exist', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: '1', ...oauthProfile });

      await service.validateOAuthLogin(
        oauthProfile.email,
        oauthProfile.firstName,
        oauthProfile.lastName,
        oauthProfile.provider,
        oauthProfile.providerId,
      );

      expect(usersService.create).toHaveBeenCalledWith({
        email: oauthProfile.email,
        name: `${oauthProfile.firstName} ${oauthProfile.lastName}`,
        provider: oauthProfile.provider,
        providerId: oauthProfile.providerId,
      });
    });

    it('should link provider to an existing local user', async () => {
      const localUser = {
        id: '1',
        email: oauthProfile.email,
        provider: 'local',
      };
      mockUsersService.findOne.mockResolvedValue(localUser);
      mockUsersService.update.mockResolvedValue({
        ...localUser,
        ...oauthProfile,
      });

      await service.validateOAuthLogin(
        oauthProfile.email,
        oauthProfile.firstName,
        oauthProfile.lastName,
        oauthProfile.provider,
        oauthProfile.providerId,
      );

      expect(usersService.update).toHaveBeenCalledWith(localUser.id, {
        provider: oauthProfile.provider,
        providerId: oauthProfile.providerId,
      });
    });

    it('should throw UnauthorizedException if provider is different', async () => {
      const existingUser = {
        id: '1',
        email: oauthProfile.email,
        provider: 'facebook',
        providerId: 'facebook-456',
      };
      mockUsersService.findOne.mockResolvedValue(existingUser);

      await expect(
        service.validateOAuthLogin(
          oauthProfile.email,
          oauthProfile.firstName,
          oauthProfile.lastName,
          oauthProfile.provider, // 'google'
          oauthProfile.providerId,
        ),
      ).rejects.toThrow(new UnauthorizedException('OAuth login failed.'));
    });
  });
});
