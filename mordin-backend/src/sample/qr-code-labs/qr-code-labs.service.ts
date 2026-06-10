import { Injectable } from '@nestjs/common';
import { CreateQrCodeLabDto } from './dto/create-qr-code-lab.dto';
import { UpdateQrCodeLabDto } from './dto/update-qr-code-lab.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QrCodeLabLog } from './entities/qr-code-lab.log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QrCodeLabsService {
  constructor(
      @InjectRepository(QrCodeLabLog)
      private readonly qrCodeLabLog: Repository<QrCodeLabLog>,
    ) { }

  create(createQrCodeLabDto: CreateQrCodeLabDto, Uid: number) {
    return 'This action adds a new qrCodeLab';
  }

  findAll() {
    return `This action returns all qrCodeLabs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} qrCodeLab`;
  }

  update(id: number, updateQrCodeLabDto: UpdateQrCodeLabDto, Uid: number) {
    return `This action updates a #${id} qrCodeLab`;
  }

  remove(id: number) {
    return `This action removes a #${id} qrCodeLab`;
  }

  getLogs() {
    return this.qrCodeLabLog.find();
  }
}
