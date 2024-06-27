import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // Route accessible sans restriction de rôle
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload: any = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      });

      if (
        !payload.roles ||
        !payload.roles.some((role: string) => roles.includes(role))
      ) {
        throw new UnauthorizedException('Forbidden resource');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authorizationHeader = request.headers.authorization;

    if (authorizationHeader) {
      const [type, token] = authorizationHeader.split(' ');

      if (type === 'Bearer' && token) {
        return token;
      }
    }

    return null;
  }
}
