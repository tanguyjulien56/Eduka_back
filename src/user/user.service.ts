import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Prisma, RoleName, User as UserModel } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetToken } from './resetToken.schema';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ResetToken.name)
    private resetTokenModel: Model<ResetToken>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      // Gérer l'erreur ici (ex. log, lancer une exception, etc.)
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async findAll(page = 0, limit = 10): Promise<User[]> {
    const options: any = {
      skip: page * limit,
      limit: limit,
    };
    return this.userModel.find({}, null, options);
  }
  // async findAll(skip?: number, take?: number): Promise<UserModel[]> {
  //   const options: any = {
  //     ...(take && { take }),
  //     ...(skip && { skip }),
  //   };
  //   return this.prisma.user.findMany(options);
  // }
  async findByUnique(
    data: Prisma.UserWhereUniqueInput,
  ): Promise<UserModel | null> {
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

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findUserById(userId: string): Promise<UserModel | null> {
    if (!userId) {
      throw new Error('User ID must be provided');
    }

    return this.prisma.user.findUnique({
      where: { id: userId },
    });
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
  async getUserRoles(userId: string): Promise<RoleName[]> {
    const roles = await this.prisma.roleHasUser.findMany({
      where: {
        user_id: userId,
      },
      include: {
        role: true,
      },
    });

    return roles.map((roleHasUser) => roleHasUser.role.name);
  }
  async generateResetToken(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const expireDate = new Date();
      console.log(user.id);

      expireDate.setDate(expireDate.getHours() + 1);
      console.log(
        '🚀 ~ UserService ~ generateResetToken ~ expireDate:',
        expireDate,
      );
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex'); // Générez un token de réinitialisation

      const newResetToken = new this.resetTokenModel({
        userId: user.id,
        token: resetToken,
        expireDate,
      });

      const savedResetToken = await newResetToken.save();
      console.log('Saved Reset Token Document:', savedResetToken);
      return resetToken;
    }
  }
}
