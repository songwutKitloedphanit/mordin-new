import { Injectable } from '@nestjs/common';
import { JWTPayload } from 'src/auth/interfaces/token';

@Injectable()
export class TestService {
  testUserDecorator(user: JWTPayload, userId: number) {
    return {
      user,
      userId,
    };
  }
}
