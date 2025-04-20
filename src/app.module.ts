import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BudgetGoalModule } from './budget-goal/budget-goal.module';
import * as dotenv from 'dotenv';
dotenv.config();



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available in the app
      envFilePath: '.env', // Path to your .env file
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.DATABASE_URL,  // Use the environment variable here
      synchronize: true,              // Set to false for production
      autoLoadEntities: true,         // Automatically load entities if they are present
    }),
    AuthModule,
    UserModule,
    TransactionModule,
    AnalyticsModule,
    BudgetGoalModule,
   
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
