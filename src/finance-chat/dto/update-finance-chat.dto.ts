import { PartialType } from '@nestjs/swagger';
import { CreateFinanceChatDto } from './create-finance-chat.dto';

export class UpdateFinanceChatDto extends PartialType(CreateFinanceChatDto) {}
