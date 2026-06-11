import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JWTPayload } from '../interfaces/token';

export const User = createParamDecorator(
  (data: keyof JWTPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JWTPayload;

    // ถ้าใช้ @User('sub') จะ return user.sub (ซึ่งคือ userId)
    // ถ้าใช้ @User() จะ return user ทั้ง object
    return data ? user?.[data] : user;
  }
);
