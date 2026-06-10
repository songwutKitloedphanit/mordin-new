import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConvertOmSetting } from "./entities/convert-om-setting.entity";
import { Repository } from "typeorm";
import { CreateConvertOmSettingDto } from "./dto/create-convert-om-setting.dto";
import { UpdateConvertOmSettingDto } from "./dto/update-convert-om-setting.dto";
import { LaboratorySetting } from "../laboratory-settings/entities/laboratory-setting.entity";
import { MachineTypeTypes } from "../enums/machine-type.enum";
import { ConvertOmSettingLog } from "./entities/convert-om-setting.log.entity";

@Injectable()
export class ConvertOmSettingService {
    constructor(
    @InjectRepository(ConvertOmSetting)
        private convertOmSettingRepository: Repository<ConvertOmSetting>,

    @InjectRepository(LaboratorySetting)
        private labSettingRepo: Repository<LaboratorySetting>,
    
    @InjectRepository(ConvertOmSettingLog)
    private convertOmSettingLog: Repository<ConvertOmSettingLog>
    ) {}

    create(createConvertOmSettingDto: CreateConvertOmSettingDto, Uid: number) {
        const convertOm = this.convertOmSettingRepository.create(createConvertOmSettingDto);
        return this.convertOmSettingRepository.save(convertOm);
    }
    
    findAll() {
        return this.convertOmSettingRepository.find({
          relations: {
            laboratorySetting: {
                laboratory:true,
                serviceCalendar: true,
            }
          }
        });
    }

    findOne(id: number) {
    return this.convertOmSettingRepository.findOne({
        where: { convertOmSettingId: id }, 
        relations: ['laboratorySetting'], 
    });
    }

    async update(id: number, updateConvertOmSettingDto: UpdateConvertOmSettingDto, Uid: number) {
        const existing = await this.convertOmSettingRepository.findOne({
            where: { convertOmSettingId: id },
        });

        if (!existing) {
            throw new NotFoundException(`ConvertOmSetting with id ${id} not found`);
        }

        const updated = this.convertOmSettingRepository.merge(existing, updateConvertOmSettingDto);
        return this.convertOmSettingRepository.save(updated);
    }

    remove(id: number) {
        return `This action removes a #${id} shop`;
    }

    getLogs(){
        return this.convertOmSettingLog.find();
    }
}