import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password-user.dto';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
  ) {}

  @Post('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    const { userId, newPassword } = changePasswordDto;

    // Vérifier si l'utilisateur existe
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('Credentials not valid');
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await this.userService.hashPassword(newPassword);

    // Mettre à jour le mot de passe utilisateur
    await this.userService.updatePassword(userId, hashedPassword);

    // Retourner les informations mises à jour de l'utilisateur
    const updatedUser = await this.userService.getUserById(userId);

    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }
  @Get('profiles/school')
  async getProfilesBySchool(
    @Req() req,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const userId = req.user.userId; // Supposant que l'ID de l'utilisateur est stocké dans la requête (par exemple, après authentification)
    const profiles = await this.profileService.findProfilesBySchool(
      userId,
      Number(skip),
      Number(take),
    );
    return { profiles };
  }
}
