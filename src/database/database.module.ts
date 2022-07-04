import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfig } from './postgres.config';

@Module({
  imports:[TypeOrmModule.forRootAsync({useClass:PostgresConfig})]
})
export class DatabaseModule {}
