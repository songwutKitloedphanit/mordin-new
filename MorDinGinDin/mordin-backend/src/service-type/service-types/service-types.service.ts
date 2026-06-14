/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ServiceType } from './entities/service-type.entity';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { ServiceLaboratory } from '../service-laboratories/entities/service-laboratory.entity';
import { ServiceCategory } from '../service-categories/entities/service-category.entity';
import { SoilGradesService } from 'src/soil-grade/soil-grades/soil-grades.service';
import { SoilGradeLevelsService } from 'src/soil-grade/soil-grade-levels/soil-grade-levels.service';
import { ServiceFertilizerMinorsService } from 'src/fertilizer/service-fertilizer-minors/service-fertilizer-minors.service';
import { UsageType } from 'src/fertilizer/usage-types/entities/usage-type.entity';
import { SoilGradeLevel } from 'src/soil-grade/soil-grade-levels/entities/soil-grade-level.entity';
import { SoilGrade } from 'src/soil-grade/soil-grades/entities/soil-grade.entity';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { FertilizerMajor } from 'src/fertilizer/fertilizer-majors/entities/fertilizer-major.entity';
import { FertilizerMinor } from 'src/fertilizer/fertilizer-minors/entities/fertilizer-minor.entity';
import { ServiceFertilizerMajorUsagesService } from 'src/fertilizer/service-fertilizer-major-usages/service-fertilizer-major-usages.service';
import { ResultGradesService } from 'src/result-grade/result-grades/result-grades.service';
import { ResultGrade } from 'src/result-grade/result-grades/entities/result-grade.entity';
import { ServiceFertilizerMinor } from 'src/fertilizer/service-fertilizer-minors/entities/service-fertilizer-minor.entity';
import { ServiceFertilizerMajorUsage } from 'src/fertilizer/service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';
import { ServiceTypesSummaryDTO } from './dto/service-types-summary.dto';
import { ServiceTypeLog } from './entities/service-type.log.entity';

@Injectable()
export class ServiceTypesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(ServiceType)
    private readonly servTypeRepo: Repository<ServiceType>,

    @InjectRepository(ServiceLaboratory)
    private readonly servLabRepo: Repository<ServiceLaboratory>,

    @InjectRepository(ServiceCategory)
    private readonly servCatRepo: Repository<ServiceCategory>,

    @InjectRepository(UsageType)
    private readonly usageTypeRepo: Repository<UsageType>,

    @InjectRepository(SoilGradeLevel)
    private soilGradeLevelsRepository: Repository<SoilGradeLevel>,

    @InjectRepository(SoilGrade)
    private readonly soilGradeRepo: Repository<SoilGrade>,

    @InjectRepository(Laboratory)
    private readonly labRepo: Repository<Laboratory>,

    @InjectRepository(FertilizerMajor)
    private readonly ferMajorRepo: Repository<FertilizerMajor>,

    @InjectRepository(FertilizerMinor)
    private readonly ferMinorRepo: Repository<FertilizerMinor>,

    @InjectRepository(ResultGrade)
    private readonly resultGradeRepo: Repository<ResultGrade>,

    @InjectRepository(ServiceFertilizerMinor)
    private readonly servFerMinorRepo: Repository<ServiceFertilizerMinor>,

    private readonly soilGradesService: SoilGradesService,

    private readonly soilGradeLevelsService: SoilGradeLevelsService,

    private readonly servFerMinorService: ServiceFertilizerMinorsService,

    private readonly servFerMajorUsageService: ServiceFertilizerMajorUsagesService,

    private readonly resultGradeService: ResultGradesService,

    @InjectRepository(ServiceTypeLog)
    private readonly servTypeLog: Repository<ServiceTypeLog>,
  ) { }

  /**
   * [OPTIMIZED] เมธอด create ที่ปรับปรุงใหม่ทั้งหมด
   */
  async create(createDto: CreateServiceTypeDto, Uid: number) {
    return this.dataSource.transaction(async manager => {

      // STEP 1 & 2 (เหมือนเดิม)
      const servTypeRepo = manager.getRepository(ServiceType);
      const servLabRepo = manager.getRepository(ServiceLaboratory);

      const newServiceType = servTypeRepo.create({
        name: createDto.name,
        price: createDto.price,
        unitDetail: createDto.unitDetail,
        color: createDto.color,
        isDisplay: createDto.isDisplay,
        updateUid: Uid,
        serviceCategories:
          createDto.serviceCategories?.map(catDto => ({ ...catDto })) ?? [],
      });

      const savedServiceType = await servTypeRepo.save(newServiceType);
      const serviceTypeId = savedServiceType.serviceTypeId;

      if (createDto.serviceLaboratories?.length) {
        const serviceLabsToCreate = createDto.serviceLaboratories.map(labDto =>
          servLabRepo.create({
            serviceTypeId: serviceTypeId,
            laboratoryId: labDto.laboratoryId,
            isDisplay: labDto.isDisplay ?? true,
          })
        );
        await servLabRepo.save(serviceLabsToCreate);
      }

      // --- STEP 3: Bulk Create Dependent Entities ---

      // 3A: ดึงข้อมูลอ้างอิง
      const [allLabs, allFerMinors, allUsageTypes] = await Promise.all([
        manager.getRepository(Laboratory).find(),
        manager.getRepository(FertilizerMinor).find(),
        manager.getRepository(UsageType).find(),
      ]);
      const labMap = new Map(allLabs.map(l => [l.laboratoryId, l]));

      // 3B: จัดการ ServiceFertilizerMinors
      const servFerMinorRepo = manager.getRepository(ServiceFertilizerMinor);
      const servFerMinorsToCreate = allFerMinors.map(ferMinor =>
        servFerMinorRepo.create({
          serviceTypeId: serviceTypeId,
          fertilizerMinorId: ferMinor.fertilizerMinorId,
          unitId: ferMinor.unitId,
          updateUid: Uid,
        })
      );
      await servFerMinorRepo.save(servFerMinorsToCreate);

      // 3C: จัดการ SoilGrades และ ResultGrades
      const soilGradeRepo = manager.getRepository(SoilGrade);
      const resultGradeRepo = manager.getRepository(ResultGrade);

      // [แก้ไข] ประกาศ Type ของ Array ให้ชัดเจน
      const soilGradesToCreate: Partial<SoilGrade>[] = [];
      const resultGradesToCreate: Partial<ResultGrade>[] = [];

      soilGradesToCreate.push(
        soilGradeRepo.create({
          serviceTypeId: serviceTypeId,
          parameter: 'Total Score',
          updateUid: Uid,
        })
      );

      createDto.serviceLaboratories?.forEach(labDto => {
        if (labDto.isDisplay) {
          const lab = labMap.get(labDto.laboratoryId);
          if (lab) {
            soilGradesToCreate.push(
              soilGradeRepo.create({
                serviceTypeId: serviceTypeId,
                laboratoryId: lab.laboratoryId,
                parameter: `${lab.shortNameAfter} (${lab.unitAfter})`,
                updateUid: Uid,
              })
            );
            resultGradesToCreate.push(
              resultGradeRepo.create({
                serviceTypeId: serviceTypeId,
                laboratoryId: lab.laboratoryId,
                updatedUid: Uid,
              })
            );
          }
        }
      });

      const [savedSoilGrades, savedResultGrades] = await Promise.all([
        soilGradeRepo.save(soilGradesToCreate),
        resultGradeRepo.save(resultGradesToCreate),
      ]);

      // 3D: สร้าง Default Levels
      const soilGradeLevelRepo = manager.getRepository(SoilGradeLevel);
      // [แก้ไข] ประกาศ Type ของ Array ให้ชัดเจน
      const soilGradeLevelsToCreate: Partial<SoilGradeLevel>[] = [];
      const totalScoreGrade = savedSoilGrades.find(
        sg => sg.parameter === 'Total Score'
      );
      const levelMappings = [
        { level: 1, score: 1, text: 'ต่ำ' },
        { level: 2, score: 2, text: 'ปานกลาง' },
        { level: 3, score: 3, text: 'สูง' },
      ];

      for (const grade of savedSoilGrades) {
        levelMappings.forEach(({ level, score, text }) => {
          soilGradeLevelsToCreate.push(
            soilGradeLevelRepo.create({
              soilGradeId: grade.soilGradeId,
              level,
              score,
              scoreName: text,
              cutoffValue: 0,
              cutoffText: '',
              updateUid: Uid,
            })
          );
        });
      }
      const savedSoilGradeLevels = await soilGradeLevelRepo.save(
        soilGradeLevelsToCreate
      );
      const totalScoreLevels = savedSoilGradeLevels.filter(
        sgl => sgl.soilGradeId === totalScoreGrade!.soilGradeId
      );

      // 3E: จัดการ ServiceFertilizerMajorUsages
      const ferMajorUsageRepo = manager.getRepository(
        ServiceFertilizerMajorUsage
      );
      // [แก้ไข] ประกาศ Type ของ Array ให้ชัดเจน
      const ferMajorUsagesToCreate: Partial<ServiceFertilizerMajorUsage>[] = [];
      if (savedServiceType.serviceCategories?.length) {
        for (const category of savedServiceType.serviceCategories) {
          for (const usageType of allUsageTypes) {
            for (const soilLevel of totalScoreLevels) {
              ferMajorUsagesToCreate.push(
                ferMajorUsageRepo.create({
                  serviceCategoryId: category.serviceCategoryId,
                  usageTypeId: usageType.usageTypeId,
                  soilGradeLevelId: soilLevel.soilGradeLevelId,
                  updateUid: Uid,
                })
              );
            }
          }
        }
      }
      await ferMajorUsageRepo.save(ferMajorUsagesToCreate);

      // --- STEP 4: ดึงข้อมูลล่าสุดกลับไปแสดงผล ---
      return manager.getRepository(ServiceType).findOne({
        where: { serviceTypeId: serviceTypeId },
        // relations ที่ต้องการให้แสดงผลกลับไป (เหมือนใน findOne)
        relations: [
          'serviceCategories',
          'updateUser',
          'serviceLaboratories',
          'serviceLaboratories.laboratories',
        ],
        order: {
          serviceLaboratories: {
            isDisplay: 'DESC',
          },
        },
      });
    });
  }

  async findWithFertilizerUsages() {
    // STEP 1: ดึงข้อมูล ServiceType ทั้งหมดแบบ "แบนๆ" (ไม่มี relations ที่เป็น Array)
    const serviceTypes = await this.servTypeRepo.find({
      select: {
        serviceTypeId: true,
        name: true,
      },
      order: {
        serviceTypeId: 'ASC',
      },
    });

    if (serviceTypes.length === 0) {
      return [];
    }

    // STEP 2: รวบรวม ID ทั้งหมดเพื่อนำไปใช้ในเงื่อนไข 'IN'
    const serviceTypeIds = serviceTypes.map(st => st.serviceTypeId);

    // STEP 3: ดึงข้อมูลลูก (Child Collections) ทั้งหมดที่เกี่ยวข้องพร้อมกันด้วย Promise.all
    const [
      serviceCategories,
      serviceLaboratories,
      serviceFertilizerMinors,
      soilGrades,
      resultGrades,
    ] = await Promise.all([
      // --- Query สำหรับ ServiceCategories ---
      this.servCatRepo.find({
        where: { serviceType: { serviceTypeId: In(serviceTypeIds) } },
        relations: {
          serviceType: true, // เอาไว้สำหรับ Grouping
          serviceFertilizerMajorUsages: {
            soilGradeLevel: true,
            usageType: true,
            fertilizerMajor: true,
          },
        },
      }),

      // --- Query สำหรับ ServiceLaboratories ---
      this.servLabRepo.find({
        where: { serviceType: { serviceTypeId: In(serviceTypeIds) } },
        relations: {
          serviceType: true, // เอาไว้สำหรับ Grouping
          laboratories: true,
        },
        order: {
          isDisplay: 'DESC',
        },
      }),

      // --- Query สำหรับ ServiceFertilizerMinors ---
      this.servFerMinorRepo.find({
        where: { serviceType: { serviceTypeId: In(serviceTypeIds) } },
        relations: {
          serviceType: true, // เอาไว้สำหรับ Grouping
          fertilizerMinor: true,
          unit: true,
          laboratory: true,
          serviceFertilizerMinorUsages: true,
        },
      }),

      // --- Query สำหรับ SoilGrades ---
      this.soilGradeRepo.find({
        where: { serviceType: { serviceTypeId: In(serviceTypeIds) } },
        relations: {
          serviceType: true, // เอาไว้สำหรับ Grouping
          soilGradeLevels: true,
          laboratory: true,
        },
        order: {
          soilGradeLevels: {
            level: 'DESC',
          },
        },
      }),

      // --- Query สำหรับ ResultGrades ---
      this.resultGradeRepo.find({
        where: { serviceType: { serviceTypeId: In(serviceTypeIds) } },
        relations: {
          resultGradeLevels: true,
          laboratory: true,
          serviceType: true, // สำคัญมากสำหรับ Grouping
        },
      }),
    ]);

    // STEP 4: จัดกลุ่มข้อมูลลูกทั้งหมดด้วย serviceTypeId เพื่อให้ง่ายต่อการดึงใช้
    // หมายเหตุ: Helper function นี้คาดว่า Child Entity ทุกตัวจะมี relation ชื่อ `serviceType` อยู่
    const groupDataByServiceTypeId = <
      T extends { serviceType?: { serviceTypeId: number } | null },
    >(
      items: T[]
    ): Map<number, T[]> => {
      const map = new Map<number, T[]>();
      for (const item of items) {
        const id = item.serviceType?.serviceTypeId;
        if (id) {
          if (!map.has(id)) {
            map.set(id, []);
          }
          // ลบ property `serviceType` ออกไปเพื่อไม่ให้ข้อมูลซ้ำซ้อนในผลลัพธ์สุดท้าย
          delete item.serviceType;
          map.get(id)!.push(item);
        }
      }
      return map;
    };

    const categoriesMap = groupDataByServiceTypeId(serviceCategories);
    const laboratoriesMap = groupDataByServiceTypeId(serviceLaboratories);
    const fertilizerMinorsMap = groupDataByServiceTypeId(
      serviceFertilizerMinors
    );
    const soilGradesMap = groupDataByServiceTypeId(soilGrades);
    const resultGradesMap = groupDataByServiceTypeId(resultGrades);

    // STEP 5: ประกอบร่างขั้นสุดท้าย โดยนำข้อมูลจาก Map ต่างๆ มาใส่ใน ServiceType แต่ละตัว
    const finalResult = serviceTypes.map(st => {
      return {
        ...st,
        serviceCategories: categoriesMap.get(st.serviceTypeId) ?? [],
        serviceLaboratories: laboratoriesMap.get(st.serviceTypeId) ?? [],
        serviceFertilizerMinors:
          fertilizerMinorsMap.get(st.serviceTypeId) ?? [],
        soilGrades: soilGradesMap.get(st.serviceTypeId) ?? [],
        resultGrades: resultGradesMap.get(st.serviceTypeId) ?? [],
      };
    });

    return finalResult;
  }

  async findAll() {
    return this.servTypeRepo.find({
      relations: [
        'serviceCategories',
        'updateUser',
        'serviceLaboratories',
        'serviceLaboratories.laboratories',
      ],
      order: {
        serviceLaboratories: {
          isDisplay: 'DESC',
        },
      },
    });
  }

  async findOne(id: number) {
    const serviceType = await this.servTypeRepo.findOne({
      where: { serviceTypeId: id },
      relations: [
        'serviceCategories',
        'updateUser',
        'serviceLaboratories',
        'serviceLaboratories.laboratories',
      ],
      order: {
        serviceLaboratories: {
          isDisplay: 'DESC',
        },
      },
    });
    if (!serviceType) {
      throw new NotFoundException('Service Type not found');
    }
    return serviceType;
  }

  async findOneWithFertilizerUsages(id: number) {
    const serviceType = await this.servTypeRepo.findOne({
      where: { serviceTypeId: id },
      select: {
        serviceTypeId: true,
        name: true,
      },
      relations: {
        serviceCategories: {
          serviceType: true,
          serviceFertilizerMajorUsages: {
            soilGradeLevel: true,
            usageType: true,
            fertilizerMajor: true,
          },
        },
        serviceLaboratories: {
          laboratories: true,
        },
        serviceFertilizerMinors: {
          fertilizerMinor: true,
          unit: true,
          laboratory: true,
          serviceFertilizerMinorUsages: true,
        },
        soilGrades: {
          soilGradeLevels: true,
          laboratory: true,
        },
      },
      order: {
        soilGrades: {
          soilGradeLevels: {
            level: 'DESC',
          },
        },
      },
    });
    if (!serviceType) {
      throw new NotFoundException('Service Type not found');
    }
    return serviceType;
  }

  /**
   * Optimized method for SoilGradeEdit page - only loads necessary data
   * This significantly improves performance by avoiding unnecessary relations
   */
  async findOneForSoilGradeEdit(id: number) {
    const serviceType = await this.servTypeRepo.findOne({
      where: { serviceTypeId: id },
      select: {
        serviceTypeId: true,
        name: true,
      },
      relations: {
        soilGrades: {
          soilGradeLevels: true,
          laboratory: true,
        },
      },
      order: {
        soilGrades: {
          soilGradeLevels: {
            level: 'DESC',
          },
        },
      },
    });
    if (!serviceType) {
      throw new NotFoundException('Service Type not found');
    }
    return serviceType;
  }

  async update(id: number, updateServiceTypeDto: UpdateServiceTypeDto, Uid: number) {

    const serviceType = await this.servTypeRepo.findOne({
      where: { serviceTypeId: id },
      relations: ['serviceCategories', 'serviceLaboratories'],
    });

    if (!serviceType) {
      throw new NotFoundException('Service Type not found');
    }

    const { name, price, unitDetail, color, isDisplay } = updateServiceTypeDto;
    const updateServiceType = {
      serviceTypeId: id,
      name,
      price,
      unitDetail,
      color,
      isDisplay,
      updateUid: Uid,
      updatedAt: Date.now(),
    };

    await this.servTypeRepo.save(updateServiceType);

    // ===== อัปเดต ServiceCategories =====
    const oldCats = serviceType.serviceCategories || [];
    const usageTypes = await this.usageTypeRepo.find();
    const soilGrade = await this.soilGradeRepo.findOne({
      where: {
        serviceTypeId: id,
        laboratoryId: IsNull(),
      },
    });

    if (!soilGrade) {
      throw new NotFoundException('Default soil grade not found.');
    }

    const soilGradeLevelTotalScore = await this.soilGradeLevelsRepository.find({
      where: {
        soilGradeId: soilGrade.soilGradeId,
      },
    });

    if (updateServiceTypeDto.serviceCategories?.length) {
      for (const newCat of updateServiceTypeDto.serviceCategories) {
        // หา category ที่มีอยู่โดยใช้ serviceCategoryId (ถ้ามี)
        const existing = oldCats.find(
          cat =>
            newCat.serviceCategoryId &&
            cat.serviceCategoryId === newCat.serviceCategoryId
        );

        if (!existing) {
          const created = await this.servCatRepo.save({
            ...newCat,
            serviceTypeId: id, // ตั้งค่า relation ให้ชัดเจน
          });
          // ===== สร้าง ServiceFertilizerMajorUsages =====

          for (const usageType of usageTypes) {
            for (const soilGradeLevel of soilGradeLevelTotalScore) {
              await this.servFerMajorUsageService.createByServiceCategories(
                created.serviceCategoryId,
                usageType.usageTypeId,
                Number(soilGradeLevel.soilGradeLevelId),
                Uid
              );
            }
          }
        } else {
          if (newCat.isDisplay !== undefined) {
            existing.isDisplay = newCat.isDisplay;
          }
          if (newCat.name !== undefined) {
            existing.name = newCat.name;
          }
          existing.serviceTypeId = id;
          const updated = await this.servCatRepo.save(existing);
        }
      }
    }

    // ===== อัปเดต ServiceLaboratories =====
    const oldLabs = serviceType.serviceLaboratories || [];

    if (updateServiceTypeDto.serviceLaboratories?.length) {
      for (const newLab of updateServiceTypeDto.serviceLaboratories) {
        const existing = oldLabs.find(
          lab => lab.laboratoryId === newLab.laboratoryId
        );

        if (!existing) {
          const created = await this.servLabRepo.save({
            ...newLab,
            serviceTypeId: id,
          });
        } else {
          if (newLab.isDisplay !== undefined) {
            existing.isDisplay = newLab.isDisplay;
          }
        }
      }

      // ตรวจสอบให้แน่ใจว่า serviceTypeId ถูกตั้งค่าในทุกๆ รายการ
      for (const lab of oldLabs) {
        if (!lab.serviceTypeId) {
          lab.serviceTypeId = id;
        }
        const created = await this.servLabRepo.save(lab);
      }
    }

    // ===== สร้าง SoilGrade ต่อ Lab (เช็คก่อน insert) =====
    for (const lab of serviceType.serviceLaboratories) {
      if (lab.isDisplay) {
        const existing = await this.soilGradeRepo.findOne({
          where: {
            serviceTypeId: id,
            laboratoryId: lab.laboratoryId,
          },
        });

        if (!existing) {
          const soilGrade =
            await this.soilGradesService.createByServiceTypeLaboratory(
              id,
              lab.laboratoryId,
              Uid
            );
          await this.soilGradeRepo.save(soilGrade);
        }
      }
    }

    const updateServType = await this.servTypeRepo.findOne({
      where: { serviceTypeId: id },
      relations: ['serviceCategories', 'serviceLaboratories'],
    });
    return updateServType;
  }

  async remove(id: number): Promise<void> {
    const userId = 99; // mock
    // 1. ค้นหา Entity ที่ต้องการลบ
    const servType = await this.servTypeRepo.findOneBy({ serviceTypeId: id });
    if (!servType) {
      throw new NotFoundException('servType not found');
    }

    // 2. แนบ userId เข้าไปใน property ที่เรานิยามไว้ใน .d.ts
    servType.removedBy = userId;

    // 3. ส่ง Entity object ที่แก้ไขแล้วไปให้ .remove()
    await this.servTypeRepo.remove(servType);
  }
  async getSummary(): Promise<ServiceTypesSummaryDTO> {
    const [totalServiceTypes, totalServiceLaboratories] = await Promise.all([
      this.servTypeRepo.count(),
      this.servLabRepo.count(),
    ]);

    return {
      totalServiceTypes,
      totalServiceLaboratories,
    };
  }
  getLogs() {
    return this.servTypeLog.find();
  }
}
