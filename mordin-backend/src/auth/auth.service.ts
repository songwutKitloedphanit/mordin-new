import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

import { AuthenRequest } from './interfaces/authen.request';
import { AuthenProfileResponse } from './interfaces/authen.response';
import { AzureResponse } from './interfaces/azure.response';
import { JWTPayload, JWTToken } from './interfaces/token';

type TokenCache = {
  access_token: string | null;
  expires_at: number | null;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private cache: TokenCache = {
    access_token: null,
    expires_at: null,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService
  ) {}

  private isTokenAvailable(): boolean {
    const now = Date.now();
    return (
      !!this.cache.access_token &&
      !!this.cache.expires_at &&
      now < this.cache.expires_at
    );
  }

  private async getAccessToken(): Promise<string> {
    if (this.isTokenAvailable()) {
      this.logger.log('Using cached Azure AD access token');
      return this.cache.access_token as string;
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<AzureResponse>(
          this.configService.get('AZURE_AD_URL') as string,
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.configService.get('CLIENT_ID') as string,
            client_secret: this.configService.get('CLIENT_SECRET') as string,
            scope: this.configService.get('SCOPE') as string,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )
      );

      this.cache = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in - 60) * 1000,
      };
      this.logger.log('Fetched new Azure AD access token');

      return data.access_token;
    } catch (error) {
      this.logger.error('Failed to get Azure AD access token', error);
      throw error;
    }
  }

  async generateTokens(payload: JWTPayload): Promise<JWTToken> {
    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
    });

    return { access_token };
  }

  async login(payload: AuthenRequest): Promise<AuthenProfileResponse> {
    const accessToken = await this.getAccessToken();

    const { data } = await firstValueFrom(
      this.httpService.post<AuthenProfileResponse>(
        this.configService.get('API_AUTHEN_PROFILE_URL') as string,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': this.configService.get(
              'APIM_SUBSCRIPTION_KEY'
            ) as string,
          },
        }
      )
    );

    this.logger.log(data);

    return data;
  }

  async mockLogin(payload: AuthenRequest): Promise<AuthenProfileResponse> {
    const env_username = this.configService.get<string>('ADMIN_USERNAME');
    const env_password = this.configService.get<string>('ADMIN_PASSWORD');
    const kuDemoPassword = this.configService.get<string>('KU_DEMO_PASSWORD') || '123456';

    const isValidAdmin =
      payload.username === env_username && payload.password === env_password;
    const isValidKUUser =
      ['admin@mitrphol.com', 'staff@mitrphol.com', 'exclusive@mitrphol.com'].includes(payload.username) &&
      !!kuDemoPassword &&
      payload.password === kuDemoPassword;

    if (isValidAdmin || isValidKUUser) {
      const email = payload.username.includes('@')
        ? payload.username
        : `${payload.username}@admin.dev`;
      const name = payload.username.split('@')[0];
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      return {
        code: 200,
        record: 1,
        message: 'Mock login successful',
        result: [
          {
            mail: email,
            userPrincipalName: email,
            companyCode: 'mock',
            department: 'KU Department',
            companyName: 'KU',
            description: 'mock',
            employeeType: 'mock',
            manager: 'mock',
            name: `${capitalizedName} KU`,
            plantCode: 'mock',
            plantName: 'mock',
            telephoneNumber: '0987654321',
          },
        ],
      };
    }
    return {
      code: 401,
      record: 0,
      message: 'Invalid credentials',
      result: [],
    };
  }
}
