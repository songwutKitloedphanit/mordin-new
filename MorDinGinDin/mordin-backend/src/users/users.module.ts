import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Department } from './entities/department.entity';
import { UserLog } from './entities/user.log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Department, UserLog])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
