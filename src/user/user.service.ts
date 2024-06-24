import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, User, User as UserModel } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<UserModel> {
    const userId = randomUUID();
    return await this.prisma.user.create({
      data: {
        ...data,
        id: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findByUnique(
    data: Prisma.UserWhereUniqueInput,
  ): Promise<UserModel | null> {
    return await this.prisma.user.findUnique({
      where: data,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

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
