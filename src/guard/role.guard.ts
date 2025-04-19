// roles.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLES_KEY } from '../role.decorator';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
  
      if (!requiredRoles) return true;
      
      const { user } = context.switchToHttp().getRequest();
      console.log('RolesGuard User:',  user);  // Debugging log
      console.log('Required Roles:', requiredRoles);    
      if (!user ) {
        throw new ForbiddenException('Access denied: Invalid User');
      }

      for(let i = 0; i < requiredRoles.length; i++) {
        if (user.roleId == requiredRoles[i]) {
          return true;
        }
      }
  
      throw new ForbiddenException('Access denied: Invalid Role');
  
     
    }
  }
  