import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../infrastructure/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      const user = { id: '1', email };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(user);
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      const id = '1';
      const user = { id, email: 'test@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOneById(id);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(user);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const userData = { email: 'new@example.com', passwordHash: 'hash' };
      const createdUser = { id: '2', ...userData };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(userData);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('update', () => {
    it('should update and return a user', async () => {
      const id = '1';
      const updateData = { name: 'Test User Updated' };
      const updatedUser = { id, email: 'test@example.com', ...updateData };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(id, updateData);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
      expect(result).toEqual(updatedUser);
    });
  });
});
