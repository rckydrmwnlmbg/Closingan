/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
