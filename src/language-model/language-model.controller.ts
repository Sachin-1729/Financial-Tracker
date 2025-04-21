import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LanguageModelService } from './language-model.service';
import { CreateLanguageModelDto } from './dto/create-language-model.dto';
import { UpdateLanguageModelDto } from './dto/update-language-model.dto';

@Controller('language-model')
export class LanguageModelController {
  constructor(private readonly languageModelService: LanguageModelService) {}

}
