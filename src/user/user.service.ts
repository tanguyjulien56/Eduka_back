import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, User, User as UserModel } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';

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

  async findByUnique(
    data: Prisma.UserWhereUniqueInput,
  ): Promise<UserModel | null> {
    console.log('hello');
    return await this.prisma.user.findUnique({
      where: data,
    });
  }
  async updateUser(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<UserModel> {
    return this.prisma.user.update({ where, data });
  }

  async findByRefreshToken(refreshToken: string): Promise<UserModel | null> {
    return this.prisma.user.findFirst({
      where: { refreshToken },
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
  // async findUserByEmail(email: string) {
  //   return this.prisma.user.findUnique({ where: { email } });
  // }
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
  async findAll(skip?: number, take?: number): Promise<UserModel[]> {
    const options: any = {
      ...(take && { take }),
      ...(skip && { skip }),
    };
    return this.prisma.user.findMany(options);
  }
}
