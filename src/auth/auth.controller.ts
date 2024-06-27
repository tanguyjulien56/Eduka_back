import {
  Body,
  Controller,
  HttpException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { SignUpUserDto } from 'src/user/dto/sign-in-user.dto';
import { SigninUserDto } from 'src/user/dto/signin-user.dto';

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
  async signin(@Body() data: SigninUserDto) {
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
  async signIn(@Body() data: SignUpUserDto): Promise<{
    access_token: string;
    refresh_token: string;
    user: any;
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

      const payload = { sub: user.id, email: user.email };

      const refresh_token = await this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_KEY_REFRESH,
        expiresIn: '8h',
      });

      await this.userService.updateUser(
        { id: user.id },
        { refreshToken: refresh_token },
      );

      const access_token = await this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_KEY,
        expiresIn: '30m',
      });

      const roles = user.roles.map((role) => role.role.name);
      let redirect_url = '/';

      if (roles.includes('PARENT')) {
        redirect_url = '/home_page_parent';
      } else if (roles.includes('SCHOOL')) {
        redirect_url = '/home_page_school';
      }

      return { access_token, refresh_token, user, redirect_url };
    } catch (error) {
      console.error('Error during signIn:', error);
      throw error;
    }
  }
}
