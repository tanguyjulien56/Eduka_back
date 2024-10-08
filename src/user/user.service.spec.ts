import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client'; // Importer l'énumération UserStatus
import { Model } from 'mongoose';
import { PrismaService } from 'prisma/prisma.service';
import { ResetToken } from './resetToken.schema';
import { User } from './user.schema';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockUUID = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        PrismaService,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            findOneAndDelete: jest.fn(),
          } as Partial<Model<User>>,
        },
        {
          provide: getModelToken(ResetToken.name),
          useValue: {
            save: jest.fn(),
            findOneAndDelete: jest.fn(),
          } as Partial<Model<ResetToken>>,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUnique', () => {
    it('should return a user based on unique data', async () => {
      const result = {
        id: mockUUID,
        email: 'test@example.com',
        password: 'hashedPassword',
        status: UserStatus.CONNECTED, // Utiliser une valeur de l'énumération UserStatus
        created_at: new Date(),
        updated_at: new Date(),
        refreshToken: 'someRefreshToken',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(result);

      const user = await service.findByUnique({ id: mockUUID });
      expect(user).toEqual(result); // Utiliser toEqual pour comparer les objets
    });
  });
});
