import { Injectable } from '@nestjs/common';
import { Profile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findProfilesBySchool(
    userId: string,
    skip?: number,
    take?: number,
  ): Promise<Profile[]> {
    const school = await this.prisma.userHasSchool.findFirst({
      where: { user_id: userId },
      select: { school_id: true },
    });

    if (!school) {
      throw new Error('School not found for the user');
    }

    const options: any = {
      where: {
        user: { userHasSchool: { some: { school_id: school.school_id } } },
      },
      skip,
      take,
    };

    return this.prisma.profile.findMany(options);
  }
}
