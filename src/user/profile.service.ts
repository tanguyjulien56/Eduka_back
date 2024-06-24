import { Injectable } from '@nestjs/common';
import { Profile } from '@prisma/client';

import { PrismaService } from 'prisma/prisma.service';
import { UserService } from './user.service'; // Import your UserService

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService, // Inject your UserService
  ) {}

  async findProfilesByUserSchool(
    userId: string, // Accept userId as string
    skip: number,
    take: number,
  ): Promise<Profile[]> {
    // Get the user using UserService
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Fetch UserHasSchool entries for the user
    const userHasSchools = await this.prisma.userHasSchool.findMany({
      where: {
        user_id: user.id,
      },
    });

    // Extract schoolIds from userHasSchools
    const schoolIds = userHasSchools.map((entry) => entry.school_id);

    // Query profiles based on schoolIds
    const profiles = await this.prisma.profile.findMany({
      where: {
        user: {
          userHasSchool: {
            some: {
              school_id: {
                in: schoolIds,
              },
            },
          },
        },
      },
      skip,
      take,
    });

    return profiles;
  }
}
