import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { RoleName } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { profileCard } from 'src/interfaces/ProfileCard';
import { PaginatorUtils } from 'src/utils/paginator.utils';
import { ChangePasswordDto } from './dto/change-password-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ProfileService } from './profile.service';
import { User } from './user.schema';
import { UserService } from './user.service';
@Controller('user')
export class UserController {
  private client: ClientProxy;
  constructor(
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    private readonly paginatorUtil: PaginatorUtils,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_SERVER_URL || 'nats://localhost:4222'],
      },
    });
  }

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

  @Get('profiles/parentsbyschool')
  @Roles(RoleName.PARENT)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  async getProfilesBySchool(
    @Request() req: any,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ): Promise<{ profiles: profileCard[]; message: string }> {
    const userId = req.user.sub;

    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }

    // Appelle la fonction qui renvoie un objet avec les valeurs skip et take
    const pagination = this.paginatorUtil.validate(skip, take);

    return {
      profiles: await this.profileService.findProfilesByUserSchool(
        pagination, // On passe l'objet contenant skip et take
        userId,
      ),
      message: 'All profiles fetched successfully',
    };
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
  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    const resetToken = await this.userService.generateResetToken(email); // Générez un token de réinitialisation

    try {
      const response = await this.client
        .send('send-reset-password-email', { email, resetToken })
        .toPromise();
      console.log(
        '🚀 ~ UserController ~ requestPasswordReset ~ response:',
        response,
      );

      console.log('Response from Email microservice:', response);

      return { message: 'Password reset email request sent.' };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email.');
    }
  }
  @Put('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { resetToken, newPassword } = resetPasswordDto;
    // trouver un reset token document valide
    const token = await this.userService.verifyResetToken(resetToken);

    if (!token) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Vérifier si l'utilisateur existe
    const user = await this.userService.findUserById(token.userId);
    if (!user) {
      throw new BadRequestException('Credentials not valid');
    }
    // Réception d'un nouveau mot de passe et hashage
    const hashedPassword = await this.userService.hashPassword(newPassword);

    // Mise à jour du mot de passe utilisateur
    await this.userService.updatePassword(token.userId, hashedPassword);

    // Réception des infos du profil mis à jour
    const updatedUser = await this.userService.findUserById(token.userId);

    // Réponse: Profil mis à jour avec succès
    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }
}
