import { Module } from '@nestjs/common';
import { DogeModule } from './doge/doge.module';
import { CallrpcModule } from './callrpc/callrpc.module';
import { DatabaseModule } from './database/database.module';


@Module({
  imports: [DogeModule, CallrpcModule, DatabaseModule]
})
export class AppModule {}
