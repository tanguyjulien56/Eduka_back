import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';

import { ChangePasswordDto } from './dto/change-password-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('change-password')
  async changePassword(@Body() ChangePasswordDto: ChangePasswordDto) {
    const { userId, newPassword } = ChangePasswordDto;

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
}
