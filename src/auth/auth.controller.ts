import {
  Body,
  Controller,
  HttpException,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { SignInUserDto } from 'src/auth/dto/signin-user.dto';

import { AuthRefreshGuard } from 'src/guards/refresh.jwt.guard';
import SignInUserInterface from 'src/interfaces/signInUser';
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
    user: SignInUserInterface; // Ajustez le type en fonction de votre entité utilisateur
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
        photo: user.profil?.photo || '',
        firstname: user.profil?.firstname || '',
        lastname: user.profil?.lastname || '',
      };

      // Signer le token d'actualisation (refresh token)
      const refresh_token = await this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_KEY_REFRESH,
        expiresIn: '1d',
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
        photo: user.profil?.photo || '',
        firstname: user.profil?.firstname || '',
        lastname: user.profil?.lastname || '',
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
  @UseGuards(AuthRefreshGuard)
  @Post('refresh_token')
  async refreshToken(
    @Request() req: any, // Accédez à la requête
  ): Promise<{ accessToken: string }> {
    try {
      // Extrait le refreshToken du header Authorization
      const authorizationHeader = req.headers.authorization;
      const token = authorizationHeader?.split(' ')[1]; // Extraire le token du format "Bearer token"

      if (!token) {
        throw new UnauthorizedException('No refresh token provided');
      }

      // Décode et vérifie le refreshToken
      const decoded = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY_REFRESH,
      });
      console.log('🚀 ~ AuthController ~ refreshToken ~ decoded:', decoded);

      // Trouve l'utilisateur associé au refreshToken
      const user = await this.userService.findUserById(decoded.sub);
      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Crée un nouveau accessToken
      const payload = {
        sub: user.id,
        email: user.email,
        roles: user.roles.map((userRole) => userRole.role.name),
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_KEY,
        expiresIn: '30m',
      });

      return { accessToken };
    } catch (error) {
      console.error('Error during refreshToken:', error);
      throw new UnauthorizedException('Failed to refresh token');
    }
  }
}
