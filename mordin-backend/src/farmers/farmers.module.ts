import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Land } from 'src/lands/entities/land.entity';
import { BooksModule } from 'src/sample/books/books.module';
import { Book } from 'src/sample/books/entities/book.entity';

import { Farmer } from './entities/farmer.entity';
import { FarmerLog } from './entities/farmer.log.entity';
import { FarmersController } from './farmers.controller';
import { FarmersService } from './farmers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Farmer, Land, FarmerLog, Book]),
    BooksModule,
  ],
  controllers: [FarmersController],
  providers: [FarmersService],
  exports: [FarmersService],
})
export class FarmersModule {}
