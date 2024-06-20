import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  constructor (private prisma: PrismaService) {
  }

  findAll() {
    return `This action returns all user`;
  }

  getById(id:any): any {
    return this.prisma.user.findUnique({
      where: { id },
    });

  }
  getByEmail(email:any): any {
    return this.prisma.user.findUnique({
      where: { email },
    });

  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
