import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditOutboxController } from './audit-outbox.controller';
import { AuditOutboxService } from './audit-outbox.service';
import { AuditOutbox } from './entities/audit-outbox.entity';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([AuditOutbox])],
  controllers: [AuditOutboxController],
  providers: [AuditOutboxService],
  exports: [AuditOutboxService],
})
export class AuditOutboxModule {}
