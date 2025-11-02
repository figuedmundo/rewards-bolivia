import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
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
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
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
      jest.spyOn(service, 'createRefreshToken').mockResolvedValue({ token: refreshToken });

      const result = await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id });
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
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if no matching token found', async () => {
      mockUsersService.findOneById.mockResolvedValue(user);
      mockPrismaService.refreshToken.findMany.mockResolvedValue([]);
      jest.spyOn(service as any, 'findMatchingToken').mockResolvedValue(null);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(ForbiddenException);
    });

    it('should return new tokens and revoke the old one', async () => {
      const oldTokenRecord = { id: 'tokenId', token: 'hashed_token' };
      const newAccessToken = 'new_access_token';
      const newRefreshToken = { token: 'new_refresh_token' };

      mockUsersService.findOneById.mockResolvedValue(user);
      mockPrismaService.refreshToken.findMany.mockResolvedValue([oldTokenRecord]);
      jest.spyOn(service as any, 'findMatchingToken').mockResolvedValue(oldTokenRecord);
      mockPrismaService.refreshToken.update.mockResolvedValue({} as any);
      jest.spyOn(service, 'createRefreshToken').mockResolvedValue(newRefreshToken);
      mockJwtService.sign.mockReturnValue(newAccessToken);

      const result = await service.refreshTokens(userId, refreshToken);

      expect(mockPrismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: oldTokenRecord.id },
        data: { revokedAt: expect.any(Date) },
      });
      expect(service.createRefreshToken).toHaveBeenCalledWith(userId);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id });
      expect(result).toEqual({ accessToken: newAccessToken, refreshToken: newRefreshToken.token });
    });
  });
});
