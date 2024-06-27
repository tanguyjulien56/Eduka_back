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
import { Roles } from './roles.decorator';

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
  @Roles('PARENT', 'SCHOOL') // Spécifiez les rôles autorisés pour cette route
  async signIn(@Body() data: SignUpUserDto): Promise<{
    access_token: string;
    redirect_url: string;
  }> {
    const user = await this.userService.findUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(
      data.password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.SECRET_KEY,
      expiresIn: '30m',
    });

    let redirect_url = '/';
    const roles = await this.userService.getUserRoles(user.id);

    if (roles.includes('PARENT')) {
      throw new UnauthorizedException('Unauthorized access for PARENT role');
    } else if (roles.includes('SCHOOL')) {
      throw new UnauthorizedException('Unauthorized access for SCHOOL role');
    }

    return { access_token, redirect_url };
  }
}
