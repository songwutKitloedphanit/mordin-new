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
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/summary')
  getSummary() {
    return this.usersService.getSummary();
  }

  @Get('/log')
  getLogs() {
    return this.usersService.getLogs();
  }

  // Departments
  @Get('/departments')
  getDepartments() {
    return this.usersService.getDepartments();
  }

  @UseGuards(AuthGuard)
  @Post('/departments')
  createDepartment(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @User('sub') userId: number
  ) {
    return this.usersService.createDepartment(createDepartmentDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/departments/:id')
  removeDepartment(@Param('id', ParseIntPipe) id: number) {
    // << ใส่ ParseIntPipe ด้วย
    return this.usersService.removeDepartment(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto, @User('sub') userId: number) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @User('sub') userId: number
  ) {
    return this.usersService.update(id, updateUserDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
