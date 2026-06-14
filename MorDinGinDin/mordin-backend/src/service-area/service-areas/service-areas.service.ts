import { ConflictException, Injectable } from '@nestjs/common';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceArea } from './entities/service-area.entity';
import { Repository } from 'typeorm';
import { Factory } from '../factories/entities/factory.entity';
import { ServiceAreaLog } from './entities/service-area.log.entity';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { QrCode } from 'src/sample/qr-codes/entities/qr-code.entity';

@Injectable()
export class ServiceAreasService {
  constructor(
    @InjectRepository(ServiceArea)
    private serviceAreaRepo: Repository<ServiceArea>,
    @InjectRepository(ServiceAreaLog)
    private serviceAreaLog: Repository<ServiceAreaLog>,

    @InjectRepository(Factory)
    private factoryRepo: Repository<Factory>,

    @InjectRepository(Farmer)
    private farmerRepo: Repository<Farmer>,

    @InjectRepository(Book)
    private bookRepo: Repository<Book>,

    @InjectRepository(QrCode)
    private qrCodeRepo: Repository<QrCode>,
  ) { }

  async checkCodes(codes: string[]): Promise<{ [key: string]: boolean }> {
    // Query to find existing codes
    const existingCodes = await this.serviceAreaRepo
      .createQueryBuilder('serviceArea')
      .select('serviceArea.code')
      .where('serviceArea.code IN (:...codes)', { codes })
      .getRawMany();

    // Map results to object with code as key and boolean as value
    const result: { [key: string]: boolean } = {};
    codes.forEach((code) => {
      result[code] = existingCodes.some(
        (existing) => existing.serviceArea_code === code,
      );
    });

    return result;
  }

  // create(createServiceAreaDto: CreateServiceAreaDto) {
  //   const updatedIServiceAreas = createServiceAreaDto.map(serviceArea => ({
  //     ...serviceArea,
  //     createUid: 1, // Mock createUid
  //   }));
  //   const serviceArea = this.serviceAreaRepo.create(updatedIServiceAreas);
  //   return this.serviceAreaRepo.save(serviceArea);
  // }

  create(createServiceAreaDto: CreateServiceAreaDto, Uid: number) {
    const serviceArea = this.serviceAreaRepo.create({
      ...createServiceAreaDto,
      updateUid: Uid,
    });
    return this.serviceAreaRepo.save(serviceArea);
  }

  findAll() {
    return this.serviceAreaRepo.find();
  }

  findOne(id: number) {
    return this.serviceAreaRepo.findOne({
      where: { serviceAreaId: id },
      relations: {
        factory: true,
        updateUser: true,
      },
    });
  }

  update(id: number, updateServiceAreaDto: UpdateServiceAreaDto, Uid: number) {
    return `This action updates a #${id} serviceArea`;
  }

  async remove(id: number) {
    const farmerCount = await this.farmerRepo.count({
      where: { serviceAreaId: id },
    });

    const bookCount = await this.bookRepo.count({
      where: { serviceAreaId: id },
    });

    const qrCodeCount = await this.qrCodeRepo.count({
      where: { serviceAreaId: id },
    });

    if (farmerCount > 0 || bookCount > 0 || qrCodeCount > 0) {
      throw new ConflictException('เขตส่งเสริมนี้มีการนำไปใช้แล้วทำให้ลบไม่ได้');
    }

    return this.serviceAreaRepo.delete(id);
  }
  getLogs() {
    return this.serviceAreaLog.find();
  }

  findByFactoryId(factoryId: number) {
    return this.serviceAreaRepo.find({
      where: { factoryId: factoryId },
      order: { name: 'ASC' },
    });
  }
}
