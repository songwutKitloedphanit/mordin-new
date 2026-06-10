import { UserRoles } from '../enums/user.enum';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserDto {
  @Expose({ name: 'userId' })
  id: number;

  @Expose()
  username: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  role: UserRoles;

  @Expose()
  departmentId: number;
}
