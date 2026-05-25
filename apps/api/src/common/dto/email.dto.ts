import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty()
  email: string;
}
