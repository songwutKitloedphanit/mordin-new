import { PartialType } from '@nestjs/swagger';
import { CreateMachineTypeDto } from './create-machine-type.dto';
import { IsEnum, IsString, Length } from 'class-validator';
import { MachineTypeTypes } from 'src/laboratory/enums/machine-type.enum';

export class UpdateMachineTypeDto extends PartialType(CreateMachineTypeDto) {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsEnum(MachineTypeTypes)
  type: MachineTypeTypes;
}
