import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { FileLoggerModule } from 'src/logger/logger.module';
import { UsersModule } from 'src/users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

export const csvHeader = ['userId', 'timestamp'] as const;

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    HttpModule,
    FileLoggerModule.register({
      name: 'login',
      csvHeader,
    }),
    JwtModule.register({
      global: true,
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
