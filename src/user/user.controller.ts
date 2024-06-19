import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password-user.dto';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    const { userId, newPassword } = changePasswordDto;

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
    const updatedUser = await this.userService.getUserById(userId);

    // Réponse: Profil mis à jour avec succès
    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }
  @Get('profiles/school')
  async getProfilesBySchool(
    @Headers('authorization') authorization: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    try {
      const token = authorization.split(' ')[1];
      const decoded = this.jwtService.verify(token); // Vérifier et décoder le JWT

      // Si le tokex est valide, appelle de la fonction pour avoir tous les profils de l'utilisateur dans profilService
      const profiles = await this.profileService.findProfilesByUserSchool(
        decoded.sub, // decode sub (user id)
        skip || 0,
        take || 10,
      );

      return { profiles };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
