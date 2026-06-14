// src/database/database.module.ts
import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Main PostgreSQL Connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'default', // ระบุชื่อ connection หลัก
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST'),
        port: config.get<number>('POSTGRES_PORT'),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('POSTGRES_DB'),
        ssl:
          process.env.POSTGRES_SSL === 'true'
            ? { rejectUnauthorized: false }
            : false,
        // บอกให้หาเฉพาะไฟล์ที่ลงท้ายด้วย .entity.ts (หรือ .js ตอน build)
        // และต้องไม่ใช่ .log.entity.ts
        entities: [
          join(__dirname, '/../**/*.entity{.ts,.js}'),
          '!' + join(__dirname, '/../**/*.log.entity{.ts,.js}'),
        ],
        synchronize: config.get('NODE_ENV') === 'test',
        extra: {
          max: 5,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        },
      }),
      inject: [ConfigService],
    }),

    // Logs PostgreSQL Connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'logs', // ตั้งชื่อ connection สำหรับ logs
      useFactory: (config: ConfigService) => ({
        name: 'logs',
        type: 'postgres',
        host: config.get('POSTGRES_LOGS_HOST'),
        port: config.get<number>('POSTGRES_LOGS_PORT'),
        username: config.get('POSTGRES_LOGS_USER'),
        password: config.get('POSTGRES_LOGS_PASSWORD'),
        database: config.get('POSTGRES_LOGS_DB'),
        ssl:
          process.env.POSTGRES_LOGS_SSL === 'true'
            ? { rejectUnauthorized: false }
            : false,
        // บอกให้หาเฉพาะไฟล์ที่ลงท้ายด้วย .log.entity.ts (หรือ .js ตอน build)
        entities: [join(__dirname, '/../**/*.log.entity{.ts,.js}')],
        entitySkipConstructor: true,
        synchronize: config.get('NODE_ENV') === 'test',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
