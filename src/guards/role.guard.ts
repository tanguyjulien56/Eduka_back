import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { BaseJWT } from './baseJwt';

@Injectable()
export class RolesGuard extends BaseJWT implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    // Récupère les rôles définis dans les métadonnées de la route
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // Si aucun rôle n'est défini, la route est accessible sans restriction
    }

    const { token } = this._extractTokenFromHeader(context);

    if (!token) {
      throw new UnauthorizedException('Token not found'); // Lève une exception si le token n'est pas trouvé
    }

    try {
      // Vérifie et décode le token JWT
      const payload: any = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      });

      // Vérifie si l'utilisateur possède l'un des rôles requis
      if (
        !payload.roles ||
        !payload.roles.some((role: string) => roles.includes(role))
      ) {
        throw new ForbiddenException('Forbidden resource'); // Lève une exception si l'utilisateur n'a pas le bon rôle
      }

      return true; // Autorise l'accès si les rôles sont valides
    } catch (error) {
      throw new UnauthorizedException('Invalid token'); // Lève une exception en cas d'erreur de vérification du token
    }
  }
}
