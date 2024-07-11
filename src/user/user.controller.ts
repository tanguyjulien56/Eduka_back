import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { ChangePasswordDto } from './dto/change-password-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ProfileService } from './profile.service';
import { User } from './user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}
  // change password at first connexion
  @Post('change-password')
  async changePassword(@Body() ChangePasswordDto: ChangePasswordDto) {
    const { userId, newPassword } = ChangePasswordDto;

    // Vérifier si l'utilisateur existe
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('Credentials not valid');
    }

    // Réception d'un nouveau mot de passe et hashage
    const hashedPassword = await this.userService.hashPassword(newPassword);

    // Mise à jour du mot de passe utilisateur
    await this.userService.updatePassword(userId, hashedPassword);

    // Réception des infos du profil mis à jour
    const updatedUser = await this.userService.findUserById(userId);

    // Réponse: Profil mis à jour avec succès
    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }
  @Get('profiles/school')
  @Roles(RoleName.PARENT) 
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  async getProfilesBySchool(
    @Request() req: any,
    @Query('skip') skip = '0',
    @Query('take') take = '10',
  ) {
    const userId = req.user.sub;

    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }

    // Convert skip and take to integers
    const skipInt = parseInt(skip, 10);
    const takeInt = parseInt(take, 10);

    const profiles = await this.profileService.findProfilesByUserSchool(
      userId,
      skipInt,
      takeInt,
    );

    return { profiles };
  }
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Query('page') page = '0',
    @Query('limit') limit = '10',
  ): Promise<User[]> {
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);

    const users = await this.userService.findAll(pageInt, limitInt);

    return users;
  }
}
