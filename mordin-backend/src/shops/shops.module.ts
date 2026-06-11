import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Shop } from './entities/shop.entity';
import { ShopLog } from './entities/shop.log.entity';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, ShopLog])],
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
