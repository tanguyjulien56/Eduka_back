// roles.guard.ts

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '@prisma/client'; // Assurez-vous d'importer votre enum RoleName de Prisma

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<RoleName[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // Aucun rôle requis, autorisation accordée
    }

    const { user } = context.switchToHttp().getRequest();
    const userRoles: RoleName[] = user.roles.map(
      (roleHasUser) => roleHasUser.role.name,
    );

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
