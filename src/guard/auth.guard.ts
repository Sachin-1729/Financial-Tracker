import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, CanActivate, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from 'src/constant';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1]; // Extract Bearer token

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      console.log(token , "token");
      const decoded = this.jwtService.verify(token, { secret: jwtConstants.secret });
      console.log(decoded , "decoded");
      request.user = decoded;  // Attach decoded user data to request object
     
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
