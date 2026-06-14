import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Res,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    return cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) { }
  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, { storage }))
  create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createShopDto: CreateShopDto,
    @User('sub') userId: number,
  ) {
    if (files && files.length > 0) {
      // Take only the first image
      createShopDto.imageUrl = `/uploads/${files[0].filename}`;
    }
    return this.shopsService.create(createShopDto, userId);
  }

  @Get()
  findAll() {
    return this.shopsService.findAll();
  }

  @Get('/summary')
  getSummary() {
    return this.shopsService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shopsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, { storage }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() updateShopDto: UpdateShopDto,
    @User('sub') userId: number,
  ) {
    // If new file uploaded, replace the old image
    if (files && files.length > 0) {
      updateShopDto.imageUrl = `/uploads/${files[0].filename}`;
    }
    // If no new file, imageUrl from body will be used (or undefined to keep existing)
    return this.shopsService.update(id, updateShopDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shopsService.remove(id);
  }

  @Get('/uploads/:imageName')
  getImage(@Param('imageName') imageName: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', imageName);

    // ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
    if (!existsSync(filePath)) {
      throw new NotFoundException('Image not found');
    }

    // กำหนด content type ตาม extension ของไฟล์
    const ext = extname(imageName).toLowerCase();
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Get('/log')
  getLogs() {
    return this.shopsService.getLogs();
  }
}
