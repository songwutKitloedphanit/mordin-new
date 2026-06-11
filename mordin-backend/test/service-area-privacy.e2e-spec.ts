import { readFileSync } from 'fs';
import { join } from 'path';

import { ValidationPipe, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { CryptoService } from 'src/common/crypto/crypto.service';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import {
  QrCodeTypeEnum,
  SampleStatusEnum,
} from 'src/sample/enums/qr-code.enum';
import { QrCode } from 'src/sample/qr-codes/entities/qr-code.entity';
import { Factory } from 'src/service-area/factories/entities/factory.entity';
import { ServiceArea } from 'src/service-area/service-areas/entities/service-area.entity';
import { ServiceTypeColor } from 'src/service-type/enums/service-types.enum';
import { ServiceType } from 'src/service-type/service-types/entities/service-type.entity';
import { Department } from 'src/users/entities/department.entity';
import { User } from 'src/users/entities/user.entity';
import { UserRoles } from 'src/users/enums/user.enum';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

jest.setTimeout(30000);

describe('service-area and public QR contracts', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let logsDataSource: DataSource;
  let adminToken: string;
  let executiveToken: string;
  let admin: User;
  const runId = Date.now().toString(36);
  const runSuffix = runId.slice(-3).toUpperCase();
  const factoryAInitial = `A${runSuffix}`;
  const factoryBInitial = `B${runSuffix}`;
  const qrFactoryInitial = `Q${runSuffix}`;
  const runDigits = String(Date.now()).slice(-6);
  const collectedNationalId = `1234567${runDigits}`;
  const happyNationalId = `1100000${runDigits}`;
  const conflictNationalIdA = `2200000${runDigits}`;
  const conflictNationalIdB = `9990000${runDigits}`;
  const happyPhone = `08${runDigits}01`;
  const conflictPhoneA = `08${runDigits}02`;
  const conflictPhoneB = `08${runDigits}03`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true })
    );
    await app.init();
    dataSource = app.get<DataSource>(getDataSourceToken());
    logsDataSource = app.get<DataSource>(getDataSourceToken('logs'));
    const migrationDir = join(process.cwd(), 'migrations');
    const mainMigration = readFileSync(
      join(migrationDir, '20260602_service_area_outbox_main.sql'),
      'utf8'
    );
    const logsMigration = readFileSync(
      join(migrationDir, '20260602_service_area_outbox_logs.sql'),
      'utf8'
    );
    await dataSource.query(mainMigration);
    await dataSource.query(mainMigration);
    await logsDataSource.query(logsMigration);
    await logsDataSource.query(logsMigration);

    const now = Date.now();
    const department = await dataSource.getRepository(Department).save({
      name: 'Integration Test',
      createdAt: now,
      updatedAt: now,
    });
    admin = await dataSource.getRepository(User).save({
      username: `integration-admin-${runId}`,
      firstName: 'Integration',
      lastName: 'Admin',
      email: `admin-${runId}@example.test`,
      role: UserRoles.Admin,
      departmentId: department.departmentId,
      updatedAt: now,
    });
    const executive = await dataSource.getRepository(User).save({
      username: `integration-executive-${runId}`,
      firstName: 'Integration',
      lastName: 'Executive',
      email: `executive-${runId}@example.test`,
      role: UserRoles.Executive,
      departmentId: department.departmentId,
      updatedAt: now,
    });
    const jwt = app.get(JwtService);
    adminToken = await jwt.signAsync(
      { sub: admin.userId, role: admin.role },
      { secret: process.env.JWT_ACCESS_SECRET }
    );
    executiveToken = await jwt.signAsync(
      { sub: executive.userId, role: executive.role },
      { secret: process.env.JWT_ACCESS_SECRET }
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  it('returns public factory DTOs without staff-only fields', async () => {
    const create = await request(app.getHttpServer())
      .post('/factories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Factory A',
        initial: factoryAInitial,
        note: 'internal',
        serviceAreas: [{ code: ' a01 ', name: 'North', note: 'internal' }],
      })
      .expect(201);

    const detail = await request(app.getHttpServer())
      .get(`/factories/${create.body.factoryId}`)
      .expect(200);
    expect(detail.body).toEqual({
      factoryId: create.body.factoryId,
      name: 'Factory A',
      initial: factoryAInitial,
      serviceAreas: [
        expect.objectContaining({
          factoryId: create.body.factoryId,
          code: 'A01',
          name: 'North',
        }),
      ],
    });
    expect(JSON.stringify(detail.body)).not.toContain('updateUid');
    expect(JSON.stringify(detail.body)).not.toContain('internal');
  });

  it('allows only admins to mutate factories', async () => {
    await request(app.getHttpServer())
      .post('/factories')
      .send({ name: 'No Auth', initial: 'NAU', serviceAreas: [] })
      .expect(401);
    await request(app.getHttpServer())
      .post('/factories')
      .set('Authorization', `Bearer ${executiveToken}`)
      .send({ name: 'Executive', initial: 'EXE', serviceAreas: [] })
      .expect(403);
  });

  it('moves an unused zone without changing its id and blocks a used zone', async () => {
    const factoryA = await dataSource.getRepository(Factory).findOneByOrFail({
      initial: factoryAInitial,
    });
    const factoryB = await request(app.getHttpServer())
      .post('/factories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Factory B',
        initial: factoryBInitial,
        serviceAreas: [{ code: 'B01', name: 'South' }],
      })
      .expect(201);
    const areaRepo = dataSource.getRepository(ServiceArea);
    const movable = await areaRepo.findOneByOrFail({
      factoryId: factoryB.body.factoryId,
      code: 'B01',
    });
    await request(app.getHttpServer())
      .patch(`/service-areas/${movable.serviceAreaId}/move`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ factoryId: factoryA.factoryId })
      .expect(200);
    expect(
      (await areaRepo.findOneByOrFail({ serviceAreaId: movable.serviceAreaId }))
        .factoryId
    ).toBe(factoryA.factoryId);

    await dataSource.getRepository(Farmer).save({
      thaiNationalId: '1234567890123',
      phone: '0812345678',
      firstName: 'Used',
      lastName: 'Zone',
      factoryId: factoryA.factoryId,
      serviceAreaId: movable.serviceAreaId,
      updateUid: admin.userId,
      updatedAt: Date.now(),
    });
    await request(app.getHttpServer())
      .patch(`/service-areas/${movable.serviceAreaId}/move`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ factoryId: factoryB.body.factoryId })
      .expect(409);

    await request(app.getHttpServer())
      .patch(`/factories/${factoryA.factoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: factoryA.name,
        initial: factoryA.initial,
        note: factoryA.note ?? '',
        serviceAreas: [
          {
            serviceAreaId: movable.serviceAreaId,
            code: 'B02',
            name: 'Changed Used Zone',
          },
        ],
        newServiceAreas: [],
      })
      .expect(409);
  });

  it('closes incomplete standalone mutations and validates numeric ids', async () => {
    await request(app.getHttpServer())
      .post('/service-areas')
      .send({})
      .expect(404);
    await request(app.getHttpServer())
      .get('/factories/not-a-number')
      .expect(400);
  });

  it('never returns national id from public QR endpoints and rejects resubmit', async () => {
    const crypto = app.get(CryptoService);
    const qrRepo = dataSource.getRepository(QrCode);
    const qrCode = await qrRepo.save({
      qrCode: `TEST-COLLECTED-01-${runId}`,
      createdUid: admin.userId,
      createdAt: Date.now(),
      type: QrCodeTypeEnum.Walkin,
      status: SampleStatusEnum.COLLECTED,
      thaiNationalId: collectedNationalId,
    });
    const encrypted = crypto.encrypt(qrCode.qrCode);
    const response = await request(app.getHttpServer())
      .get(`/qr-codes/encrypt-code/${encrypted}`)
      .expect(200);
    expect(response.body).toEqual({
      status: SampleStatusEnum.COLLECTED,
      message: 'Soil sample information has already been recorded',
    });
    expect(JSON.stringify(response.body)).not.toContain(collectedNationalId);

    await request(app.getHttpServer())
      .patch(`/qr-codes/update-data-by-farmer/${encrypted}`)
      .send({
        firstName: 'Repeat',
        lastName: 'Submit',
        phoneNumber: happyPhone,
        thaiNationalId: collectedNationalId,
        serviceAreaId: 1,
        landCode: '',
        landName: '',
        serviceTypeId: 1,
        latitude: '13.000000',
        longitude: '100.000000',
      })
      .expect(400);
  });

  describe('public soil-sample collection flow (update-data-by-farmer)', () => {
    const crypto = () => app.get(CryptoService);
    const qrRepo = () => dataSource.getRepository(QrCode);
    const bookRepo = () => dataSource.getRepository(Book);
    const farmerRepo = () => dataSource.getRepository(Farmer);

    // ฟิลด์บังคับของ Factory/ServiceArea/ServiceType เพื่อให้ fixture มีที่อ้างอิงจริง
    let zoneId: number;
    let factoryId: number;
    let serviceTypeId: number;

    beforeAll(async () => {
      const ts = Date.now();
      const factory = await dataSource.getRepository(Factory).save({
        name: 'QR Flow Factory',
        initial: qrFactoryInitial,
        updateUid: admin.userId,
        updatedAt: ts,
      });
      factoryId = factory.factoryId;
      const zone = await dataSource.getRepository(ServiceArea).save({
        factoryId,
        code: 'QRF01',
        name: 'QR Flow Zone',
        updateUid: admin.userId,
        updatedAt: ts,
      });
      zoneId = zone.serviceAreaId;
      const serviceType = await dataSource.getRepository(ServiceType).save({
        name: 'อ้อย',
        price: 0,
        unitDetail: 'ตัวอย่าง',
        color: ServiceTypeColor.Primary,
        updateUid: admin.userId,
        updatedAt: ts,
      });
      serviceTypeId = serviceType.serviceTypeId;
    });

    const basePayload = () => ({
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      phoneNumber: happyPhone,
      thaiNationalId: happyNationalId,
      serviceAreaId: zoneId,
      serviceTypeId,
      landCode: '',
      landName: 'แปลงทดสอบ',
      areaSize: 12,
      // subdistrictCode/zipCode เป็น metadata optional (FK chain Geography→Province→
      // District→Subdistrict) — ตัดออกเพื่อให้ integration test โฟกัสที่แก่นของ flow
      // (status transition, farmer link, book creation, GPS validation)
      latitude: '13.736717',
      longitude: '100.523186',
    });

    it('records a DISTRIBUTED sample, flips status to COLLECTED, and links the matching farmer', async () => {
      // เกษตรกรจริงที่ตรงทั้งเลขบัตรและเบอร์
      const farmer = await farmerRepo().save({
        thaiNationalId: happyNationalId,
        phone: happyPhone,
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        factoryId,
        serviceAreaId: zoneId,
        updateUid: admin.userId,
        updatedAt: Date.now(),
      });
      const qr = await qrRepo().save({
        qrCode: `QR-FLOW-HAPPY-${runId}`,
        createdUid: admin.userId,
        createdAt: Date.now(),
        type: QrCodeTypeEnum.Walkin,
        status: SampleStatusEnum.DISTRIBUTED,
      });
      const encrypted = crypto().encrypt(qr.qrCode);

      const res = await request(app.getHttpServer())
        .patch(`/qr-codes/update-data-by-farmer/${encrypted}`)
        .send(basePayload())
        .expect(200);
      expect(res.body).toEqual({
        status: SampleStatusEnum.COLLECTED,
        message: 'Soil sample information has been recorded',
      });

      // ตรวจผลใน DB จริง: status เปลี่ยน + book ถูกสร้างและผูก farmer
      const savedQr = await qrRepo().findOneByOrFail({ qrCodeId: qr.qrCodeId });
      expect(savedQr.status).toBe(SampleStatusEnum.COLLECTED);
      expect(savedQr.firstName).toBe('สมชาย');
      const book = await bookRepo().findOneByOrFail({ qrCodeId: qr.qrCodeId });
      expect(book.farmerId).toBe(farmer.farmerId);
      expect(Number(book.serviceAreaId)).toBe(zoneId);
      expect(book.latitude).not.toBeNull();
    });

    it('saves the sample WITHOUT a farmer link when national id and phone match different farmers', async () => {
      // เลขบัตรตรงคนหนึ่ง เบอร์ตรงอีกคนหนึ่ง → conflict
      await farmerRepo().save({
        thaiNationalId: conflictNationalIdA,
        phone: conflictPhoneA,
        firstName: 'มี',
        lastName: 'บัตรตรง',
        factoryId,
        serviceAreaId: zoneId,
        updateUid: admin.userId,
        updatedAt: Date.now(),
      });
      await farmerRepo().save({
        thaiNationalId: conflictNationalIdB,
        phone: conflictPhoneB,
        firstName: 'มี',
        lastName: 'เบอร์ตรง',
        factoryId,
        serviceAreaId: zoneId,
        updateUid: admin.userId,
        updatedAt: Date.now(),
      });
      const qr = await qrRepo().save({
        qrCode: `QR-FLOW-CONFLICT-${runId}`,
        createdUid: admin.userId,
        createdAt: Date.now(),
        type: QrCodeTypeEnum.Walkin,
        status: SampleStatusEnum.DISTRIBUTED,
      });
      const encrypted = crypto().encrypt(qr.qrCode);

      await request(app.getHttpServer())
        .patch(`/qr-codes/update-data-by-farmer/${encrypted}`)
        .send({
          ...basePayload(),
          thaiNationalId: conflictNationalIdA, // ตรง farmer คนแรก
          phoneNumber: conflictPhoneB, // ตรง farmer คนที่สอง
        })
        .expect(200);

      // ตัวอย่างถูกบันทึก (status COLLECTED) แต่ไม่ผูก farmer ใด
      const savedQr = await qrRepo().findOneByOrFail({ qrCodeId: qr.qrCodeId });
      expect(savedQr.status).toBe(SampleStatusEnum.COLLECTED);
      const book = await bookRepo().findOneByOrFail({ qrCodeId: qr.qrCodeId });
      expect(book.farmerId ?? null).toBeNull();
    });

    it('rejects an invalid GPS coordinate before persisting', async () => {
      const qr = await qrRepo().save({
        qrCode: `QR-FLOW-BADGPS-${runId}`,
        createdUid: admin.userId,
        createdAt: Date.now(),
        type: QrCodeTypeEnum.Walkin,
        status: SampleStatusEnum.DISTRIBUTED,
      });
      const encrypted = crypto().encrypt(qr.qrCode);

      await request(app.getHttpServer())
        .patch(`/qr-codes/update-data-by-farmer/${encrypted}`)
        .send({ ...basePayload(), latitude: '999', longitude: '999' })
        .expect(400);

      // ต้องไม่เปลี่ยน status ถ้าพิกัดไม่ผ่าน
      const savedQr = await qrRepo().findOneByOrFail({ qrCodeId: qr.qrCodeId });
      expect(savedQr.status).toBe(SampleStatusEnum.DISTRIBUTED);
    });
  });
});
