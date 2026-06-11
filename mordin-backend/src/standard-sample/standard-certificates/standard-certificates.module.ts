import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';

import { Standard } from '../standards/entities/standard.entity';

import { StandardCertificate } from './entities/standard-certificate.entity';
import { StandardCertificateLog } from './entities/standard-certificate.log.entity';
import { StandardCertificatesController } from './standard-certificates.controller';
import { StandardCertificatesService } from './standard-certificates.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StandardCertificate,
      Standard,
      Laboratory,
      StandardCertificateLog,
    ]),
  ],
  controllers: [StandardCertificatesController],
  providers: [StandardCertificatesService],
  exports: [StandardCertificatesService],
})
export class StandardCertificatesModule {}
