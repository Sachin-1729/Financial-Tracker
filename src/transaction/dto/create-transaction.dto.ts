import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 100 })
  amount: number;

  @IsEnum(['income', 'expense'])
  @IsNotEmpty()
  @ApiProperty({ enum: ['income', 'expense'], example: 'income' })
  type: 'income' | 'expense';

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Freelance payment', required: false })
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ example: '2023-06-01' })
  date: string; // Keep it string, it will parse to Date


}
