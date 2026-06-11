import { Module, Global, DynamicModule } from '@nestjs/common';

import { FileLoggerService } from './file-logger.service';
import { FileLoggerConfig } from './logger.config';

@Global()
@Module({
  providers: [
    {
      provide: FileLoggerService,
      useFactory: () => {
        return new FileLoggerService();
      },
    },
  ],
  exports: [FileLoggerService],
})
export class FileLoggerModule {
  static register(config: FileLoggerConfig): DynamicModule {
    return {
      module: FileLoggerModule,
      providers: [
        {
          provide: FileLoggerService,
          useValue: new FileLoggerService(config),
        },
      ],
      exports: [FileLoggerService],
    };
  }
}
