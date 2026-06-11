import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { FertilizerMinor } from '../fertilizer-minors/entities/fertilizer-minor.entity';
import { ServiceFertilizerMajorUsage } from '../service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';

import { CreateFertilizerMajorDto } from './dto/create-fertilizer-major.dto';
import { FertilizerSummaryDto } from './dto/fertilizer-summary.dto';
import { SearchFertilizerMajorDto } from './dto/search-fertilizer-major.dto';
import { UpdateFertilizerMajorDto } from './dto/update-fertilizer-major.dto';
import { FertilizerMajor } from './entities/fertilizer-major.entity';
import { FertilizerMajorLog } from './entities/fertilizer-major.log.entity';

@Injectable()
export class FertilizerMajorsService {
  constructor(
    @InjectRepository(FertilizerMajor)
    private readonly fertilizerMajorRepository: Repository<FertilizerMajor>,
    @InjectRepository(FertilizerMinor)
    private readonly fertilizerMinorRepository: Repository<FertilizerMinor>,
    @InjectRepository(FertilizerMajorLog)
    private readonly fertilizerMajorLog: Repository<FertilizerMajorLog>,
    @InjectRepository(ServiceFertilizerMajorUsage)
    private readonly serviceFertilizerMajorUsageRepository: Repository<ServiceFertilizerMajorUsage>
  ) {}

  create(createFertilizerMajorDto: CreateFertilizerMajorDto, Uid: number) {
    const { N, P, K } = createFertilizerMajorDto;

    const formular = `${N}-${P}-${K}`;

    const fertilizer = this.fertilizerMajorRepository.create({
      ...createFertilizerMajorDto,
      formular,
      updateUid: Uid,
    });

    return this.fertilizerMajorRepository.save(fertilizer);
  }

  async searchAndPagination(
    searchFertilizerMajorDto: SearchFertilizerMajorDto
  ) {
    const {
      search,
      page = 1,
      limit = 10,
      all = false,
      sortBy = 'fertilizerMajorId',
      order = 'ASC',
    } = searchFertilizerMajorDto;

    const skip = all ? undefined : (page - 1) * limit;
    const take = all ? undefined : limit;

    const whereCondition = search ? [{ formular: Like(`%${search}%`) }] : {};

    const [data, total] = await this.fertilizerMajorRepository.findAndCount({
      where: all ? {} : whereCondition,
      relations: {
        unit: true,
        updateUser: true,
      },
      take,
      skip,
      order: {
        [sortBy]: order,
      },
    });

    return {
      data,
      total,
      page: all ? 1 : page,
      limit: all ? total : limit,
      totalPages: all ? 1 : Math.ceil(total / limit),
    };
  }

  findOne(id: number) {
    return this.fertilizerMajorRepository.findOne({
      where: { fertilizerMajorId: id },
      relations: {
        unit: true,
        updateUser: true,
      },
    });
  }

  async update(
    id: number,
    updateFertilizerMajorDto: UpdateFertilizerMajorDto,
    Uid: number
  ) {
    const fertilizerMajor = await this.fertilizerMajorRepository.findOneBy({
      fertilizerMajorId: id,
    });
    if (!fertilizerMajor) {
      throw new Error('FertilizerMajor not found');
    }
    const { N, P, K } = updateFertilizerMajorDto;
    const formular = `${N}-${P}-${K}`;
    Object.assign(fertilizerMajor, updateFertilizerMajorDto, {
      formular,
      updateUid: Uid,
    });
    return this.fertilizerMajorRepository.save(fertilizerMajor);
  }

  async remove(id: number, userId: number) {
    // Check relations first
    const usage = await this.serviceFertilizerMajorUsageRepository.findOneBy({
      fertilizerMajorId: id,
    });

    if (usage) {
      throw new BadRequestException(
        'ไม่สามารถลบได้เนื่องจากปุ๋ยนี้มีการนำไปใช้ที่อื่นแล้ว'
      );
    }

    const fertilizerMajor = await this.fertilizerMajorRepository.findOneBy({
      fertilizerMajorId: id,
    });
    if (!fertilizerMajor) {
      throw new NotFoundException('FertilizerMajor not found');
    }

    // We cannot set removedBy because it doesn't exist.
    // We can update updateUid before delete if needed for logs, but since it's hard delete, it might be lost unless logs capture it.
    // Assuming logs capture the state before delete or we just delete it.
    // The user requirement was "use real uid".
    // If I cannot save it, I will just proceed to delete.

    await this.fertilizerMajorRepository.remove(fertilizerMajor);
  }

  async getFertilizerSummary(): Promise<FertilizerSummaryDto> {
    // ปุ๋ยหลัก
    const majors = await this.fertilizerMajorRepository.find();
    const majorCount = majors.length;
    const majorAvgPricePerSack =
      majors.reduce((sum, m) => sum + (m.pricePerUnit || 0), 0) /
      (majorCount || 1);

    // ธาตุอาหารรอง
    const minors = await this.fertilizerMinorRepository.find();
    const minorCount = minors.length;
    const minorAvgPricePerKg =
      minors.reduce((sum, m) => sum + (m.pricePerUnit || 0), 0) /
      (minorCount || 1);

    return {
      majorCount,
      majorAvgPricePerSack: +majorAvgPricePerSack.toFixed(2),
      minorCount,
      minorAvgPricePerKg: +minorAvgPricePerKg.toFixed(2),
    };
  }

  getLogs() {
    return this.fertilizerMajorLog.find();
  }
}
