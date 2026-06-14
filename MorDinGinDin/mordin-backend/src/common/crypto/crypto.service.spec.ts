import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { ConfigModule } from '@nestjs/config';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ qrSecret: '6uQ1mDsE97bL4xGhfWd9ZrT2nKpAC8yX' })],
        }),
      ],
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt and decrypt correctly', () => {
    const plainText = 'HelloNestJS';
    const encrypted = service.encrypt(plainText);
    expect(encrypted).not.toEqual(plainText);

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toEqual(plainText);
  });
});
