import { Injectable } from '@nestjs/common';
import { Profile } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from './user.service';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async findProfilesByUserSchool(
    userId: string,
    skip: number,
    take: number,
  ): Promise<Profile[]> {
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const userHasSchools = await this.prisma.userHasSchool.findMany({
      where: {
        user_id: user.id,
      },
    });

    const schoolIds = userHasSchools.map((entry) => entry.school_id);

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
          roles: {
            some: {
              role: {
                name: 'PARENT',
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
