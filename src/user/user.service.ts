import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async getProfilesBySchool(userId: string) {
    // Vérifier si l'utilisateur est authentifié et a une école référente
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userHasSchool: true },
    });

    if (!user || !user.userHasSchool.length) {
      throw new UnauthorizedException('Unauthorized');
    }

    const schoolId = user.userHasSchool[0].school_id;

    // Récupérer les profils liés à l'école
    const profiles = await this.prisma.profile.findMany({
      where: {
        user: {
          userHasSchool: {
            some: {
              school_id: schoolId,
            },
          },
        },
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        photo: true,
        address_id: true,
      },
    });

    return profiles;
  }
}
