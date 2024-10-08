import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export class BaseJWT {
  protected _extractTokenFromHeader(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const authorizationHeader = request.headers.authorization;

    if (authorizationHeader) {
      const [type, token] = authorizationHeader.split(' ');

      if (type === 'Bearer' && token) {
        return {
          token,
          request,
        };
      }
    }

    return {
      token: null,
      request,
    };
  }
}
