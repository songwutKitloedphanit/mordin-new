import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRoles } from 'src/users/enums/user.enum';
import { AuditOutboxService } from './audit-outbox.service';

@Controller('audit-outbox')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.Admin)
export class AuditOutboxController {
  constructor(private readonly auditOutboxService: AuditOutboxService) {}

  @Get('summary')
  getSummary() {
    return this.auditOutboxService.getSummary();
  }
}
