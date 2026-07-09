import { IsString, IsNotEmpty, IsHexColor } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  color: string;
}

export class AssignLabelDto {
  @IsString()
  @IsNotEmpty()
  labelId: string;
}
