import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UserRoles } from './enums/user.enum';
import { AuthenProfile } from 'src/auth/interfaces/authen.response';
import { UserSummaryDTO } from './dto/user-summary.dto';
import { UserLog } from './entities/user.log.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,

    @InjectRepository(UserLog)
    private userLog: Repository<UserLog>
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.userRepo.create({
      ...createUserDto,
    });
    return this.userRepo.save(user);
  }

  findAll() {
    const user = this.userRepo.find({
      relations: ['department'],
    });

    return user;
  }

  findByUsername(username: string) {
    return this.userRepo.findOneBy({ username });
  }

  async findOrCreateUser(
    username: string,
    profile: AuthenProfile,
    role: UserRoles = UserRoles.Executive,
  ): Promise<User> {
    let user = await this.findByUsername(username);
    if (!user) {
      const [firstName, lastName] = profile.name.split(' ');
      const department = await this.findOrCreateDepartment(
        profile.department,
      );

      const newUser: CreateUserDto = {
        username,
        email: profile.mail || profile.userPrincipalName,
        firstName,
        lastName,
        role,
        departmentId: department.departmentId,
      };
      user = await this.create(newUser);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto, Uid: number) {
    const user = await this.userRepo.findOneBy({ userId: id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto, { updateUid: Uid });

    return this.userRepo.save(user);
  }

  async updateProfile(id: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepo.findOneBy({ userId: id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.firstName = updateProfileDto.firstName;
    user.lastName = updateProfileDto.lastName;
    user.email = updateProfileDto.email;
    user.updateUid = id;

    return this.userRepo.save(user);
  }

  async remove(id: number) {
    const userId = 99; // mockUid ...
    const user = await this.userRepo.findOneBy({ userId: id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.removedBy = userId;

    await this.userRepo.remove(user);
  }

  async findOrCreateDepartment(name: string): Promise<Department> {
    let department = await this.departmentRepo.findOneBy({ name });
    if (!department) {
      department = await this.createDepartment({ name });
    }
    return department;
  }

  createDepartment(createDepartmentDto: CreateDepartmentDto) {
    const department = this.departmentRepo.create(createDepartmentDto);
    return this.departmentRepo.save(department);
  }

  getDepartments() {
    return this.departmentRepo.find();
  }

  async removeDepartment(id: number) {
    const department = await this.departmentRepo.findOneBy({
      departmentId: id,
    });
    if (!department) {
      return { deleted: false, message: 'Department not found' };
    }

    await this.departmentRepo.remove(department); // ลบโดยใช้ instance
    return { deleted: true };
  }

  async getSummary() {
    const users = await this.findAll();

    const userSummary: UserSummaryDTO = {
      totalUsers: users.length,
      adminAmount: 0,
      executiveAmount: 0,
      staffAmount: 0,
    };

    users.forEach(({ role }) => {
      switch (role) {
        case UserRoles.Admin:
          userSummary.adminAmount++;
          break;
        case UserRoles.Staff:
          userSummary.staffAmount++;
          break;
        case UserRoles.Executive:
          userSummary.executiveAmount++;
          break;
      }
    });

    return userSummary;
  }

  getLogs() {
    return this.userLog.find();
  }
  async findOne(id: number) {
  return this.userRepo.findOne({
    where: { userId: id },
    relations: ['department'],
  });
}
}
