import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import * as moment from 'moment';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 100 })
  amount: number;

  @IsEnum(['income', 'expense'])
  @IsNotEmpty()
  @ApiProperty({ enum: ['income', 'expense'], example: 'income' })
  type: 'income' | 'expense';

  @IsString()
  @ApiProperty({ example: 'Freelance payment', required: false })
  description?: string;


  @Transform(({ value }) => {
    const parsed = moment(value, ['YYYY-MM-DD', 'DD-MM-YYYY'], true);
    if (!parsed.isValid()) throw new Error('Invalid date format. Use YYYY-MM-DD or DD-MM-YYYY');
    return parsed.format('YYYY-MM-DD');
  })
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ example: '2023-06-01' })
  date: string; // Keep it string, it will parse to Date


}
