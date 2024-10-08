import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseJWT } from './baseJwt';

@Injectable()
export class AuthGuard extends BaseJWT implements CanActivate {
  constructor(private jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { token, request } = this._extractTokenFromHeader(context);

    if (!token) {
      console.log('Authorization header missing');
      throw new UnauthorizedException('Authorization header missing');
    }

    try {
      console.log('Attempting to verify token:', token);
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      });

      console.log('Token verified successfully. Payload:', payload);

      // Assigner le payload à la propriété 'user' de l'objet request pour un accès ultérieur dans les route handlers
      request.user = payload;

      console.log('User assigned to request:', request.user);

      return true;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
