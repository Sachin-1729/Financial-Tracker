import { PartialType } from '@nestjs/swagger';
import { CreateLanguageModelDto } from './create-language-model.dto';

export class UpdateLanguageModelDto extends PartialType(CreateLanguageModelDto) {}
