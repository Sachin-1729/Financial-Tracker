import { Module } from '@nestjs/common';
import { LanguageModelService } from './language-model.service';
import { LanguageModelController } from './language-model.controller';

@Module({
  controllers: [LanguageModelController],
  providers: [LanguageModelService],
})
export class LanguageModelModule {}
