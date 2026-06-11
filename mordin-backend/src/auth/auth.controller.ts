import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { FileLoggerService } from 'src/logger/file-logger.service';
import { UpdateProfileDto } from 'src/users/dto/update-profile.dto';
import { UserRoles } from 'src/users/enums/user.enum';
import { UsersService } from 'src/users/users.service';

import { AuthGuard, RequestWithAuth } from './auth.guard';
import { csvHeader } from './auth.module';
import { AuthService } from './auth.service';
import { AuthenRequest } from './interfaces/authen.request';
import { AuthenProfileResponse } from './interfaces/authen.response';
import { BaseResponse } from './interfaces/response';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly fileLoggerService: FileLoggerService,
    private readonly configService: ConfigService
  ) {}

  private handleError(error: unknown): never {
    if (isAxiosError(error)) {
      const response = error.response?.data;
      const statusCode =
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE;

      throw new HttpException(
        {
          code: statusCode,
          message: response?.message || 'Service Unavailable',
        },
        statusCode
      );
    } else {
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: AuthenRequest
  ): Promise<BaseResponse<{ access_token: string }>> {
    const timestamp = Date.now();
    const date = new Date(timestamp).toISOString().split('T')[0];
    let _response: AuthenProfileResponse | undefined;
    try {
      const isDevMode =
        this.configService.get<string>('ADMIN_USERNAME') === body.username;
      const isKUUser = ['admin@KU', 'staff@KU', 'exclusive@KU'].includes(
        body.username
      );
      const response =
        isDevMode || isKUUser
          ? await this.authService.mockLogin(body)
          : await this.authService.login(body);

      const { code, message, result: userInfo } = (_response = response);

      if (code !== HttpStatus.OK) {
        throw new HttpException(
          {
            code,
            message,
          },
          code
        );
      }

      let role = isDevMode ? UserRoles.Admin : UserRoles.Executive;
      if (isKUUser) {
        if (body.username === 'admin@KU') role = UserRoles.Admin;
        else if (body.username === 'staff@KU') role = UserRoles.Staff;
        else if (body.username === 'exclusive@KU') role = UserRoles.Executive;
      }

      const user = await this.userService.findOrCreateUser(
        body.username,
        Array.isArray(userInfo) ? userInfo[0] : userInfo,
        role
      );

      const token = await this.authService.generateTokens({
        sub: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      this.fileLoggerService.save<typeof csvHeader>({
        type: 'csvAndRaw',
        csvData: {
          userId: user.userId,
          timestamp,
        },
        csvFilePath: `history/${date}.csv`,
        data: response,
        rawFilePath: `success/${user.userId}_${timestamp}`,
      });

      return {
        code: HttpStatus.OK,
        message: 'Login Successful',
        data: {
          access_token: token.access_token,
        },
      };
    } catch (error) {
      this.fileLoggerService.save<typeof csvHeader>({
        type: 'csvAndRaw',
        csvData: {
          userId: body.username,
          timestamp,
        },
        csvFilePath: `history/${date}.csv`,
        data:
          error instanceof HttpException && _response
            ? _response
            : isAxiosError(error)
              ? error.response?.data
              : error,
        rawFilePath: `fail/${body.username}_${timestamp}`,
      });

      if (error instanceof HttpException) {
        throw error;
      }
      this.handleError(error);
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: RequestWithAuth) {
    try {
      const user = req.user;
      const userInfo = await this.userService.findByUsername(user.username);
      return {
        code: HttpStatus.OK,
        message: 'Profile retrieved successfully',
        data: userInfo,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Req() req: RequestWithAuth,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    const user = await this.userService.updateProfile(
      Number(req.user.sub),
      updateProfileDto
    );

    return {
      code: HttpStatus.OK,
      message: 'Profile updated successfully',
      data: user,
    };
  }
}
