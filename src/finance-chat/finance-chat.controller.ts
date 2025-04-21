import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { FinanceChatService } from './finance-chat.service';
import { RequestWithUser } from '../interface/request.user.interface'; 
import { JwtAuthGuard } from 'src/guard/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('Finance Chat')  // Add a tag for categorizing this controller in Swagger
@ApiBearerAuth()  // Automatically add Bearer token authentication
@Controller('finance-chat')
export class FinanceChatController {
  constructor(private readonly financeChatService: FinanceChatService) {}

  @Post()
  @ApiOperation({ summary: 'Get AI response to a finance-related question' })  // Describes the endpoint operation
  @ApiResponse({
    status: 200,
    description: 'The AI response was successfully retrieved.',
    schema: {
      example: 'AI response to the finance-related question here.',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User is not authenticated.',
  })
  @ApiResponse({
    status: 500,
    description: 'Could not process the request due to server error.',
  })
  @ApiBody({
    description: 'User question to get financial insights',
    type: Object,
    schema: {
      example: {
        question: "How much did I spend last week?",
      },
    },
  })
  async getAIResponse(
    @Request() req: RequestWithUser, 
    @Body('question') question: string
  ): Promise<string> {
    const userId = req.user?.id;  // Extract userId from req.user

    if (!userId) {
      return 'User not authenticated. Please log in first.';
    }

    // Call the service method to get the response from OpenAI
    const response = await this.financeChatService.getAIResponse(userId, question);

    // If no valid response, return an appropriate message
    if (!response) {
      return 'Sorry, I could not process your request. Please try again later.';
    }

    return response;
  }
}
