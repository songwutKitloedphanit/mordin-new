import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { StandardCertificatesService } from './standard-certificates.service';
import { CreateStandardCertificateDto } from './dto/create-standard-certificate.dto';
import { UpdateStandardCertificateDto } from './dto/update-standard-certificate.dto';
import { UpdateStandardCertificateValueFromFileDto } from './dto/update-standard-certificate-value-file.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('standard-certificates')
export class StandardCertificatesController {
  constructor(
    private readonly standardCertificatesService: StandardCertificatesService
  ) {}
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createStandardCertificateDto: CreateStandardCertificateDto,
    @User('sub') userId: number
  ) {
    return this.standardCertificatesService.create(
      createStandardCertificateDto,
      userId
    );
  }

  @Get()
  findAll() {
    return this.standardCertificatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.standardCertificatesService.findOne(+id);
  }
  @UseGuards(AuthGuard)
  @Patch('file')
  async updateCertificateFromFile(
    @Body() inputs: UpdateStandardCertificateValueFromFileDto[]
  ) {
    await this.standardCertificatesService.updateCertificateValueFromFile(
      inputs
    );
    return { message: 'Updated standard certificate (CRM) successfully.' };
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.standardCertificatesService.remove(+id);
  }

  @Get('/log')
  getLogs() {
    return this.standardCertificatesService.getLogs();
  }
}
