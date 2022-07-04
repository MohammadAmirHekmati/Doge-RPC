import { Body, Controller, Get, Param, Post, Query, ValidationPipe } from '@nestjs/common';
import { DogeService } from '../services/doge.service';
import { SendTransactionDto } from '../dto/send-transaction.dto';
import { RpcResponse } from 'jsonrpc-ts';
import { InjectRepository } from '@nestjs/typeorm';
import { DogeWalletEntity } from '../entities/doge-wallet.entity';
import { Repository } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("Doge Wallet")
@Controller('doge')
export class DogeController {
  constructor(private dogeService:DogeService)
  {}

  @Get("transaction/notify")
  async dogeWalletNotify(@Query("transaction") transaction:any):Promise<any>
  {
    console.log(transaction);
    return await this.dogeService.dogeWalletNotify(transaction)
  }

  @Get("wallet/total/balance")
  async getCoreWalletBalance():Promise<any>
  {
    return await this.dogeService.getCoreWalletBalance()
  }

  @Post("send/transaction")
  async sendTransaction(@Body(ValidationPipe) sendTransactionDto:SendTransactionDto):Promise<any>
  {
    return await this.dogeService.sendTransaction(sendTransactionDto)
  }

  @Get("transaction/:txid")
  async checkTransaction(@Param("txid") txId:string):Promise<any>
  {
    return await this.dogeService.checkTransaction(txId)
  }

  @Get("generate/new/wallet")
  async generateNewAddress():Promise<any>
  {
    return await this.dogeService.generateNewAddress()
  }
}
