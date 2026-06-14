import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { FileLoggerModule } from 'src/logger/logger.module';

export const csvHeader = ['userId', 'timestamp'] as const;

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    HttpModule,
    FileLoggerModule.register({
      name: 'login',
      csvHeader: csvHeader,
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
