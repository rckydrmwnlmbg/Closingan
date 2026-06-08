import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
