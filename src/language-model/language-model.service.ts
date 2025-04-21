import { Injectable } from '@nestjs/common';
import { CreateLanguageModelDto } from './dto/create-language-model.dto';
import { UpdateLanguageModelDto } from './dto/update-language-model.dto';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class LanguageModelService {

  private readonly openai: OpenAI;
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message?.content || '';
  }
  
}
