import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

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

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorizationHeader = request.headers.authorization;

    if (authorizationHeader) {
      const [type, token] = authorizationHeader.split(' ');

      if (type === 'Bearer' && token) {
        return token;
      }
    }

    return undefined;
  }
}
