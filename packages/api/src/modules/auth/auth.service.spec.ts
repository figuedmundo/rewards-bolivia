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
import { ConfigModule } from '@nestjs/config';
import { User } from '@prisma/client';
import { RegisterUserDto } from '@rewards-bolivia/shared-types';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findOneById: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              create: jest.fn(),
              updateMany: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigModule,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') {
                return 'test-secret';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const user: Partial<User> = {
        id: '1',
        email: 'test@test.com',
        role: 'client',
      };
      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);
      jest
        .spyOn(service, 'createRefreshToken')
        .mockImplementation(() => Promise.resolve({ token: refreshToken }));

      const result = await service.login(user as User);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        role: user.role,
      });
      expect(service.createRefreshToken).toHaveBeenCalledWith(user.id);
      expect(result).toEqual({ accessToken, refreshToken });
    });
  });

  describe('logout', () => {
    it('should revoke all refresh tokens for a user', async () => {
      const userId = '1';
      jest
        .spyOn(prismaService.refreshToken, 'updateMany')
        .mockResolvedValue({ count: 1 });
      await service.logout(userId);
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId, revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('refreshTokens', () => {
    const userId = '1';
    const refreshToken = 'valid_refresh_token';
    const user: Partial<User> = {
      id: userId,
      email: 'test@test.com',
      role: 'client',
    };

    it('should throw ForbiddenException if user not found', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(null);
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if no matching token found', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(user as User);
      jest.spyOn(prismaService.refreshToken, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(service as any, 'findMatchingToken')
        .mockReturnValue(Promise.resolve(null));

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return new tokens and revoke the old one', async () => {
      const oldTokenRecord = { id: 'tokenId', token: 'hashed_token' };
      const newAccessToken = 'new_access_token';
      const newRefreshToken = { token: 'new_refresh_token' };

      jest.spyOn(usersService, 'findOneById').mockResolvedValue(user as User);
      jest
        .spyOn(prismaService.refreshToken, 'findMany')
        .mockResolvedValue([oldTokenRecord as any]);
      jest
        .spyOn(service as any, 'findMatchingToken')
        .mockReturnValue(Promise.resolve(oldTokenRecord));
      jest
        .spyOn(prismaService.refreshToken, 'update')
        .mockResolvedValue({} as any);
      jest
        .spyOn(service, 'createRefreshToken')
        .mockResolvedValue(newRefreshToken);
      jest.spyOn(jwtService, 'sign').mockReturnValue(newAccessToken);

      const result = await service.refreshTokens(userId, refreshToken);

      expect(prismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: oldTokenRecord.id },
        data: { revokedAt: expect.any(Date) },
      });
      expect(service.createRefreshToken).toHaveBeenCalledWith(userId);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        role: user.role,
      });
      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken.token,
      });
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const dto: RegisterUserDto = {
        email: 'new@user.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };
      const newUser: Partial<User> = {
        id: 'new-id',
        email: dto.email,
        passwordHash: 'hashed_password',
      };
      const tokens = {
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(newUser as User);
      jest.spyOn(service, 'login').mockResolvedValue(tokens);

      const result = await service.register(dto);

      expect(usersService.findOne).toHaveBeenCalledWith(dto.email);
      expect(usersService.create).toHaveBeenCalledWith({
        email: dto.email,
        passwordHash: expect.any(String),
        name: `${dto.firstName} ${dto.lastName}`,
      });
      expect(service.login).toHaveBeenCalledWith(newUser);

      // Check the new return structure
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user.email).toBe(dto.email);
      expect(result.accessToken).toBe(tokens.accessToken);
      expect(result.refreshToken).toBe(tokens.refreshToken);
    });

    it('should throw ConflictException if email is already registered', async () => {
      const dto: RegisterUserDto = {
        email: 'existing@user.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };
      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue({ id: '1', email: dto.email } as User);

      await expect(service.register(dto)).rejects.toThrow(
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
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue({
        id: '1',
        ...oauthProfile,
      } as any);

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
      const localUser: Partial<User> = {
        id: '1',
        email: oauthProfile.email,
        provider: 'local',
      };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(localUser as User);
      jest.spyOn(usersService, 'update').mockResolvedValue({
        ...localUser,
        ...oauthProfile,
      } as User);

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
      const existingUser: Partial<User> = {
        id: '1',
        email: oauthProfile.email,
        provider: 'facebook',
        providerId: 'facebook-456',
      };
      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue(existingUser as User);

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
