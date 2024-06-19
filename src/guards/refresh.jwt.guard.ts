import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
@Injectable()
export class AuthRefreshGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('hello');
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    console.log('🚀 ~ AuthGuard ~ canActivate ~ token:', token);
    if (!token) {
      throw new UnauthorizedException('Not authorized');
    }
    try {
      console.log('SECRET_KEY:', process.env.SECRET_KEY);
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY_REFRESH,
      });
      console.log('🚀 ~ AuthGuard ~ canActivate ~ payload:', payload);

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['refreshToken'] = token;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException(e);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
