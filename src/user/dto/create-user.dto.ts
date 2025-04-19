import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongpassword' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 2, required: false, description: 'Optional. Defaults to 2' })
  @IsOptional()
  roleId?: number;
}
