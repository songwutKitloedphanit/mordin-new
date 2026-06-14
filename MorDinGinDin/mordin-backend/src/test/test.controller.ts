import { Controller, Get, UseGuards } from '@nestjs/common';
import { TestService } from './test.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { JWTPayload } from 'src/auth/interfaces/token';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @UseGuards(AuthGuard)
  @Get('/user-decorator')
  testUserDecorator(
    @User() user: JWTPayload,
    @User('sub')  userId: number
  ){
    return this.testService.testUserDecorator(user, userId)
  }

}
