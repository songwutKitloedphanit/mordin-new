import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoles } from 'src/users/enums/user.enum';

import { RequestWithAuth } from './auth.guard';
import { ROLES_KEY } from './decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    return requiredRoles.includes(request.user.role);
  }
}
