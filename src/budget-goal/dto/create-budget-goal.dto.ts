import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreateBudgetGoalDto {
  @ApiProperty({
    example: 5000,
    description: 'The total amount the user wants to save or spend in 30 days.',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  goalAmount: number;
}
