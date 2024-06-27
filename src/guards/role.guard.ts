import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService, // Injectez le service utilisateur ici
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      // Si aucun rôle n'est spécifié, autorise l'accès
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.id; // Supposons que vous ayez un middleware d'authentification qui place l'utilisateur dans la demande

    // Récupérer les rôles de l'utilisateur depuis la table de jointure roleHasUser
    const userRoles = await this.userService.getUserRoles(userId);

    // Vérifie si l'utilisateur a le rôle requis
    return requiredRoles.some((role: RoleName) => userRoles.includes(role));
  }
}
