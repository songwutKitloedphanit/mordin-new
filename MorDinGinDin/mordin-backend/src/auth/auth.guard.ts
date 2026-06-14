import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWTPayload } from './interfaces/token';

export interface RequestWithAuth extends Request {
  user: JWTPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new HttpException({
        code: HttpStatus.UNAUTHORIZED,
        message: 'No token provided',
      }, HttpStatus.UNAUTHORIZED);
    }

    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      request.user = payload;
    } catch {
      throw new HttpException({
        code: HttpStatus.UNAUTHORIZED,
        message: 'Invalid token',
      }, HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}
