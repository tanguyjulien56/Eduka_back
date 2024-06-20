import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/guards/jwt.guard';
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
  @UseGuards(AuthGuard)
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
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      });

      // Si le token est valide, appellez la fonction pour récupérer tous les profils de l'utilisateur dans profileService
      const profiles = await this.profileService.findProfilesByUserSchool(
        payload.sub, // Utilisez payload.sub (id de l'utilisateur) pour récupérer les profils
        skip || 0,
        take || 10,
      );

      return { profiles };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
