import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password-user.dto';
import { GetProfilesDto } from './dto/get-profiles.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  @UseGuards(AuthGuard('jwt'))
  @Get('profiles/school')
  async getProfilesBySchool(
    @Req() req: Request,
    @Query() query: GetProfilesDto,
  ) {
    const userId = req.user['id'];
    const { page, limit } = query;
    const profiles = await this.userService.getProfilesBySchool(
      userId,
      Number(page) || 1,
      Number(limit) || 10,
    );
    return { profiles: profiles.profiles, total: profiles.totalProfiles };
  }
}
