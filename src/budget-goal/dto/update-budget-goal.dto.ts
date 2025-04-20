// update-budget-goal.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBudgetGoalDto {
  @ApiProperty({
    example: 1000.50,
    description: 'The updated budget goal amount in decimal format',
    required: true,
  })
  goalAmount: number;
}
