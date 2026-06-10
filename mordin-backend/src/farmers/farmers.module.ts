import { Module } from '@nestjs/common';
import { FarmersService } from './farmers.service';
import { FarmersController } from './farmers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farmer } from './entities/farmer.entity';
import { Land } from 'src/lands/entities/land.entity';
import { FarmerLog } from './entities/farmer.log.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { BooksModule } from 'src/sample/books/books.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Farmer,
      Land,
      FarmerLog,
      Book
    ]),
    BooksModule
  ],
  controllers: [FarmersController],
  providers: [FarmersService],
  exports: [FarmersService],
})
export class FarmersModule {}
