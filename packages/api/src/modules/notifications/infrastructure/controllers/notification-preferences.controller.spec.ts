import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPreferencesController } from './notification-preferences.controller';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import type { RequestWithUser } from '@rewards-bolivia/shared-types';

describe('NotificationPreferencesController', () => {
  let controller: NotificationPreferencesController;
  let prisma: PrismaService;

  const mockUserId = 'test-user-123';
  const mockRequest = {
    user: {
      userId: mockUserId,
    },
  } as RequestWithUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationPreferencesController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationPreferencesController>(
      NotificationPreferencesController,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getPreferences', () => {
    it('should return emailNotifications field for authenticated user', async () => {
      const mockUser = {
        emailNotifications: true,
      };

      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(mockUser as any);

      const result = await controller.getPreferences(mockRequest);

      expect(result).toEqual({
        emailNotifications: true,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { emailNotifications: true },
      });
    });

    it('should throw BadRequestException when user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(controller.getPreferences(mockRequest)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('updatePreferences', () => {
    it('should update emailNotifications field for authenticated user', async () => {
      const updateDto: UpdatePreferencesDto = {
        emailNotifications: false,
      };

      const updatedUser = {
        emailNotifications: false,
      };

      jest
        .spyOn(prisma.user, 'update')
        .mockResolvedValue(updatedUser as any);

      const result = await controller.updatePreferences(
        updateDto,
        mockRequest,
      );

      expect(result).toEqual({
        emailNotifications: false,
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { emailNotifications: false },
        select: { emailNotifications: true },
      });
    });

    it('should enforce authentication - extracts userId from JWT token in request', async () => {
      const updateDto: UpdatePreferencesDto = {
        emailNotifications: true,
      };

      const updatedUser = {
        emailNotifications: true,
      };

      jest
        .spyOn(prisma.user, 'update')
        .mockResolvedValue(updatedUser as any);

      const result = await controller.updatePreferences(
        updateDto,
        mockRequest,
      );

      // Verify userId was extracted from token and used
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { emailNotifications: true },
        select: { emailNotifications: true },
      });
    });

    it('should return updated preference value after successful update', async () => {
      const updateDto: UpdatePreferencesDto = {
        emailNotifications: true,
      };

      const updatedUser = {
        emailNotifications: true,
      };

      jest
        .spyOn(prisma.user, 'update')
        .mockResolvedValue(updatedUser as any);

      const result = await controller.updatePreferences(
        updateDto,
        mockRequest,
      );

      expect(result.emailNotifications).toBe(true);
    });
  });
});
