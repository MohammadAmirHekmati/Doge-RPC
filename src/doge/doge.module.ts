import {Injectable, Module} from '@nestjs/common';
import { DogeController } from './controllers/doge.controller';
import { DogeService } from './services/doge.service';
import { RpcClientOptions } from 'jsonrpc-ts';
import {CallrpcService} from "../callrpc/callrpc.service";
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DogeWalletEntity } from './entities/doge-wallet.entity';
import { DogePendingTransactionEntity } from './entities/doge-pending-transaction.entity';
import { DogeReceiveTransactionEntity } from './entities/doge-receive-transaction.entity';
import { DogeSendTransactionEntity } from './entities/doge-send-transaction.entity';

@Module({
  controllers: [DogeController],
  providers: [DogeService,CallrpcService],
  imports:[ScheduleModule.forRoot(),TypeOrmModule.forFeature([DogeWalletEntity,DogePendingTransactionEntity,DogeReceiveTransactionEntity,DogeSendTransactionEntity])]
})
export class DogeModule {}
