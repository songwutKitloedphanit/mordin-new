import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { Repository } from 'typeorm';
import { ShopSummaryDTO } from './dto/shop-summary.dto';
import { ShopLog } from './entities/shop.log.entity';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    @InjectRepository(ShopLog)
    private shopLog: Repository<ShopLog>,
  ) { }
  async create(createShopDto: CreateShopDto, Uid: number) {
    const shop = this.shopRepository.create(createShopDto);
    shop.updateUid = Uid;
    return this.shopRepository.save(shop);
  }

  findAll() {
    return this.shopRepository.find({
      relations: ['subdistrict', 'subdistrict.district', 'subdistrict.district.province'],
    });
  }

  async findOne(id: number) {
    const shop = await this.shopRepository.findOne({
      where: { shopId: id },
      relations: ['subdistrict', 'subdistrict.district', 'subdistrict.district.province'],
    });

    if (!shop) {
      throw new NotFoundException(`Shop #${id} not found`);
    }

    return shop;
  }

  async update(id: number, updateShopDto: UpdateShopDto, Uid: number) {
    const shop = await this.findOne(id);

    // Merge updates
    const updatedShop = this.shopRepository.merge(shop, updateShopDto);
    updatedShop.updateUid = Uid;

    return this.shopRepository.save(updatedShop);
  }

  async remove(id: number) {
    const shop = await this.findOne(id);
    try {
      return await this.shopRepository.remove(shop);
    } catch (error) {
      if (error?.code === '23503') {
        throw new ConflictException('ไม่สามารถลบร้านค้านี้ได้เนื่องจากมีการใช้งานอยู่ในส่วนอื่น');
      }
      throw error;
    }
  }

  async getSummary() {
    const shops = await this.findAll();

    const shopSummary: ShopSummaryDTO = {
      totalShops: shops.length,
    }

    return shopSummary;
  }

  getLogs() {
    return this.shopLog.find();
  }
}
