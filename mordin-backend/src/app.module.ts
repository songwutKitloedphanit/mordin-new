import { ConfigurableModuleBuilder, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BusesModule } from './buses/buses.module';
import { FarmersModule } from './farmers/farmers.module';
import { LandsModule } from './lands/lands.module';
import { ServiceCalendarsModule } from './service-calendars/service-calendars.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { AddressModule } from './address/address.module';
import { ShopsModule } from './shops/shops.module';
import { FertilizerModule } from './fertilizer/fertilizer.module';
import { AuthModule } from './auth/auth.module';
import { ReferenceDataModule } from './reference-data/reference-data.module';
import { LaboratoryModule } from './laboratory/laboratory.module';
import { ServiceTypeModule } from './service-type/service-type.module';
import { SoilGradeModule } from './soil-grade/soil-grade.module';
import { ServiceAreaModule } from './service-area/service-area.module';
import { SampleModule } from './sample/sample.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { ResultGradeModule } from './result-grade/result-grade.module';
import { StandardSampleModule } from './standard-sample/standard-sample.module';
import { ConvertOmSettingModule } from './laboratory/convert-om-settings/convert-om-settings.module';
import { ResultsModule } from './sample/results/results.module';
import { getNamespace } from 'cls-hooked';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { DashboardModule } from './dashboard/dashboard.module';
import { LoggingSubscriber } from './common/subscribers/logging.subscriber';
import { AuditOutboxModule } from './audit-outbox/audit-outbox.module';

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
