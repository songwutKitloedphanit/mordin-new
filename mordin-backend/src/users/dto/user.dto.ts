import { Exclude, Expose } from 'class-transformer';

import { UserRoles } from '../enums/user.enum';

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
