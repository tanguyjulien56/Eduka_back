import {
  Body,
  Controller,
  HttpException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { SignInUserDto } from 'src/auth/dto/signin-user.dto';

import SingInUserInterface from 'src/interfaces/singInUser';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Post('signin')
  async signin(@Body() data: SignInUserDto) {
    // does email exists ? (we need to have a user. First we need to declare a cont user to test an email and password)
    const user = await this.userService.findUserByEmail(data.email);
    if (!user) {
      throw new HttpException("credentials don't match", 401);
    }

    // is password correct ?
    const isValid = await this.authService.compare(
      data.password,
      user.password,
    );
    if (!isValid) {
      throw new HttpException("credentials psw don't match", 401);
    }
    // token creation
    const payload = { sub: user.id, username: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_KEY,
        expiresIn: '30min',
      }),
    };
  }
  // @Post('signUp')
  // async signUp(@Body() data: CreateUserDto): Promise<any> {
  //   const user = await this.userService.findByUnique({ email: data.email });
  //   if (user) {
  //     throw new UnauthorizedException(401, 'server error');
  //   }
  //   data.password = await this.authService.hash(data.password);

  //   const newUser = await this.userService.create(data);
  //   const payload = {
  //     sub: newUser.id,
  //     email: newUser.email,
  //   };
  //   return {
  //     access_token: await this.jwtService.signAsync(payload, {
  //       secret: process.env.SECRET_KEY,
  //       expiresIn: '1d',
  //     }),
  //   };
  // }
  @Post('signInJulien')
  async signIn(@Body() data: SignInUserDto): Promise<{
    access_token: string;
    refresh_token: string;
    user: SingInUserInterface; // Ajustez le type en fonction de votre entité utilisateur
    redirect_url: string;
  }> {
    try {
      console.log('Received login request:', data.email);

      const user = await this.userService.findUserByEmail(data.email);
      console.log('🚀 ~ AuthController ~ user:', user);

      if (!user) {
        console.log('User not found');
        throw new UnauthorizedException('Wrong credentials');
      }

      const isPasswordMatching = await bcrypt.compare(
        data.password,
        user.password,
      );

      if (!isPasswordMatching) {
        throw new UnauthorizedException('Wrong credentials');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        roles: user.roles.map((userRole) => userRole.role.name),
      };

      // Signer le token d'actualisation (refresh token)
      const refresh_token = await this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_KEY_REFRESH,
        expiresIn: '8h',
      });

      // Mettre à jour le champ `refreshToken` dans la base de données
      await this.userService.updateUser(
        { id: user.id },
        { refreshToken: refresh_token },
      );

      // Signer le token d'accès (access token)
      const access_token = await this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_KEY,
        expiresIn: '30m',
      });

      // Déterminer l'URL de redirection en fonction des rôles de l'utilisateur
      let redirect_url = '/';
      if (payload.roles.includes('PARENT')) {
        redirect_url = '/home_page_parent';
      }
      if (payload.roles.includes('SCHOOL')) {
        redirect_url = '/home_page_school';
      }
      console.log('🚀 ~ AuthController ~ signIn ~ redirect_url:', redirect_url);
      // le user n'a qu'un role. on ajoute le role au user
      const userWithRole = {
        //@dev typage et retirer les champs
        id: user.id,
        email: user.email,
        status: user.status,
        role: user.roles[0]?.role.name,
      };

      // réponse au frontend
      return {
        access_token,
        refresh_token,
        user: userWithRole,
        redirect_url,
      };
    } catch (error) {
      console.error('Error during signIn:', error);
      throw error;
    }
  }
}
