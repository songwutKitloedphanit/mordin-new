import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { getNamespace } from 'cls-hooked';

import { AddressModule } from './address/address.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditOutboxModule } from './audit-outbox/audit-outbox.module';
import { AuthModule } from './auth/auth.module';
import { BusesModule } from './buses/buses.module';
import { CommonModule } from './common/common.module';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { LoggingSubscriber } from './common/subscribers/logging.subscriber';
import { ConfigModule } from './config/config.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseModule } from './database/database.module';
import { FarmersModule } from './farmers/farmers.module';
import { FertilizerModule } from './fertilizer/fertilizer.module';
import { ConvertOmSettingModule } from './laboratory/convert-om-settings/convert-om-settings.module';
import { LaboratoryModule } from './laboratory/laboratory.module';
import { LandsModule } from './lands/lands.module';
import { ReferenceDataModule } from './reference-data/reference-data.module';
import { ResultGradeModule } from './result-grade/result-grade.module';
import { ResultsModule } from './sample/results/results.module';
import { SampleModule } from './sample/sample.module';
import { ServiceAreaModule } from './service-area/service-area.module';
import { ServiceCalendarsModule } from './service-calendars/service-calendars.module';
import { ServiceTypeModule } from './service-type/service-type.module';
import { ShopsModule } from './shops/shops.module';
import { SoilGradeModule } from './soil-grade/soil-grade.module';
import { StandardSampleModule } from './standard-sample/standard-sample.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    DatabaseModule,

    BusesModule,
    FarmersModule,
    LandsModule,
    ServiceCalendarsModule,
    UsersModule,
    AddressModule,
    ShopsModule,
    FertilizerModule,
    AuthModule,
    ReferenceDataModule,
    LaboratoryModule,
    ServiceTypeModule,
    SoilGradeModule,
    ServiceAreaModule,
    SampleModule,
    CommonModule,
    ConfigModule,
    ResultGradeModule,
    StandardSampleModule,
    ConvertOmSettingModule,
    ResultsModule,
    DashboardModule,
    AuditOutboxModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggingSubscriber,
    {
      provide: 'REQUEST_NAMESPACE',
      useFactory: () => getNamespace('request'),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
