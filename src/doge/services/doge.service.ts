import { BadRequestException, HttpStatus, Injectable, Logger, Query } from '@nestjs/common';
import { RpcClient, RpcClientOptions, RpcRequest, RpcResponse, RpcResponseError } from 'jsonrpc-ts';
import { DogeModule } from '../doge.module';
import { endWith } from 'rxjs/operators';
import {CallrpcService} from "../../callrpc/callrpc.service";
import { SendTransactionDto } from '../dto/send-transaction.dto';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { GetCoreWalletBalanceResponseDto } from '../dto/get-core-wallet-balance-response.dto';
import { CronJob } from 'cron';
import compileStreaming = WebAssembly.compileStreaming;
import { InjectRepository } from '@nestjs/typeorm';
import { DogeWalletEntity } from '../entities/doge-wallet.entity';
import { Repository } from 'typeorm';
import { CheckTransactionResponse } from '../inerfaces/check-transacion.response';
import { DogePendingTransactionEntity } from '../entities/doge-pending-transaction.entity';
import { DogeReceiveTransactionEntity } from '../entities/doge-receive-transaction.entity';
import { DogeSendTransactionEntity } from '../entities/doge-send-transaction.entity';

@Injectable()
export class DogeService {
  constructor(private callRpcService:CallrpcService,
              @InjectRepository(DogeWalletEntity) private dogeWalletRepository:Repository<DogeWalletEntity>,
              @InjectRepository(DogePendingTransactionEntity) private dogePendingTransactionRepo:Repository<DogePendingTransactionEntity>,
              @InjectRepository(DogeReceiveTransactionEntity) private dogeReceiveTransactionRepo:Repository<DogeReceiveTransactionEntity>,
              @InjectRepository(DogeSendTransactionEntity) private dogeSendTransactionRepo:Repository<DogeSendTransactionEntity>)
  {}

  async dogeWalletNotify(transaction:any):Promise<any>
  {
    const checkTransaction:CheckTransactionResponse=await this.checkTransaction(transaction)
      if (checkTransaction.confirmations<1)
      {
        const transactionDetail=checkTransaction.details[0]
        if (transactionDetail.category=="receive")
        {
          const findPendingTransaction=await this.dogePendingTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
          if (!findPendingTransaction)
          {
            const dogePendingTransactionEntity=new DogePendingTransactionEntity()
            dogePendingTransactionEntity.account=transactionDetail.account
            dogePendingTransactionEntity.address=transactionDetail.address
            dogePendingTransactionEntity.amount=transactionDetail.amount
            dogePendingTransactionEntity.category=transactionDetail.category
            dogePendingTransactionEntity.confirmations=checkTransaction.confirmations
            dogePendingTransactionEntity.label=transactionDetail.label
            dogePendingTransactionEntity.receiveTime=checkTransaction.timereceived
            dogePendingTransactionEntity.time=checkTransaction.time
            dogePendingTransactionEntity.txid=checkTransaction.txid
            const savedPendingTransaction=await this.dogePendingTransactionRepo.save(dogePendingTransactionEntity)
            console.log(`We gonna receive some Doge...!  txId: ${checkTransaction.txid}`);
          }
        }
         if (transactionDetail.category=="send")
        {
          const findPendingTransaction=await this.dogePendingTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
          if (!findPendingTransaction)
          {
            const dogePendingTransactionEntity=new DogePendingTransactionEntity()
            dogePendingTransactionEntity.account=transactionDetail.account
            dogePendingTransactionEntity.address=transactionDetail.address
            dogePendingTransactionEntity.amount=transactionDetail.amount
            dogePendingTransactionEntity.category=transactionDetail.category
            dogePendingTransactionEntity.confirmations=checkTransaction.confirmations
            dogePendingTransactionEntity.label=transactionDetail.label
            dogePendingTransactionEntity.receiveTime=checkTransaction.timereceived
            dogePendingTransactionEntity.time=checkTransaction.time
            dogePendingTransactionEntity.txid=checkTransaction.txid
            dogePendingTransactionEntity.fee=transactionDetail.fee
            const savedPendingTransaction=await this.dogePendingTransactionRepo.save(dogePendingTransactionEntity)
            console.log(`We lose some Doge...!  txId: ${checkTransaction.txid}`);
          }
        }
      }
  }

  async unlockWallet(master_pass:string):Promise<any>
  {
    const walletPass=await this.callRpcService.walletOptions()
    let method="walletpassphrase"
    const rpcOptions=await this.callRpcService.getDogeRpcOptions()
    const rpcClient=new RpcClient(rpcOptions)
    const rpcRequest:RpcRequest<any>=
      {
        id: Math.floor(Math.random() * 99999 - 11111),
        method: method,
        jsonrpc: '2.0',
        params: [`Elyas!123`,60]
      }

      const sendRequest=await rpcClient.makeRequest(rpcRequest)
    if (sendRequest.status!==HttpStatus.OK)
      throw new BadRequestException()

    if (sendRequest.data.error)
      throw new BadRequestException(`Wallet Dont Unlocked...!`)
  }

  async sendTransaction(sendTransactionDto:SendTransactionDto):Promise<RpcResponse<any>>
  {
    const {targetWallet,amount,commentFrom,commentTo,subtractFee}=sendTransactionDto

    let method="sendtoaddress"

    const walletOptions=await this.callRpcService.walletOptions()
    const master_pass=walletOptions.wallet_pass
    const unlockWallet=await this.unlockWallet(master_pass)

    const rpcOptions=await this.callRpcService.getDogeRpcOptions()
    const rpcClient=new RpcClient(rpcOptions)
    const rpcRequest:RpcRequest<any>=
      {
        id: Math.floor(Math.random() * 99999 - 11111),
        method: method,
        jsonrpc: '2.0',
        params: [`${targetWallet}`,amount, `${commentFrom}`,`${commentTo}`,subtractFee]
      }
      const sendRequest=await rpcClient.makeRequest(rpcRequest)
    if (sendRequest.status!==HttpStatus.OK)
      throw new BadRequestException()

    if (sendRequest.data.error)
      throw new BadRequestException(`You Have Error In Request`)

    return sendRequest.data
  }

  async getCoreWalletBalance(): Promise<number>
  {
    let method= 'getbalance';
    const rpcOptions = await this.callRpcService.getDogeRpcOptions()
    const rpcClient = new RpcClient(rpcOptions);
    const rpcRequest: RpcRequest<any> = {
      id: Math.floor(Math.random() * 99999 - 11111),
      method: method,
      jsonrpc: '2.0',
      params: [],
    };
    const sendRequest = await rpcClient.makeRequest(rpcRequest);
    if (sendRequest.status !== HttpStatus.OK)
      throw new BadRequestException(`Request Failed...!`);

    const requestData:RpcResponse<any>=sendRequest.data
    return requestData.result
  }

  async checkTransaction(txId:string):Promise<any>
  {
    let method="gettransaction"
    const rpcOptions=await this.callRpcService.getDogeRpcOptions()
    const rpcClient=new RpcClient(rpcOptions)
    const rpcRequest:RpcRequest<any>=
      {
        id:Math.floor(Math.random() * 99999 - 11111),
        jsonrpc:"2.0",
        method:method,
        params:[`${txId}`]
      }
      const sendRequest=await rpcClient.makeRequest(rpcRequest)
    if (sendRequest.status!==HttpStatus.OK)
      throw new BadRequestException()

    const requestData:RpcResponse<CheckTransactionResponse>=sendRequest.data
    if (requestData.error)
      return requestData.error

    return requestData.result
  }

  async generateNewAddress():Promise<RpcResponse<any>>
  {
    let method="getnewaddress"

    const rpcOptions=await this.callRpcService.getDogeRpcOptions()
    const rpcClient=new RpcClient(rpcOptions)
    const rpcRequest:RpcRequest<any>=
      {
        id:Math.floor(Math.random() * 99999 - 11111),
        jsonrpc:"2.0",
        method:method,
        params:[]
      }
      const sendRequest=await rpcClient.makeRequest(rpcRequest)
    if (sendRequest.status!==HttpStatus.OK)
      throw new BadRequestException()

    if (sendRequest.data.error)
      return sendRequest.data

    const dogeWallet=new DogeWalletEntity()
    dogeWallet.address=sendRequest.data.result
    const savedWallet=await this.dogeWalletRepository.save(dogeWallet)
    return sendRequest.data
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async transferAssetsToMasterWallet()
  {
    const setBalanceForTransfer=2
    console.log(`Cron Raned...!`);
    const walletOptions=await this.callRpcService.walletOptions()
    const getCoreWalletBalance=await this.getCoreWalletBalance()
    console.log(getCoreWalletBalance);
    if (getCoreWalletBalance<=setBalanceForTransfer)
      console.log(`Balance Should be more than ${setBalanceForTransfer}`);
    if (getCoreWalletBalance>setBalanceForTransfer)
    {
      const sendTransactionDto:SendTransactionDto=
        {
          targetWallet:walletOptions.target_wallet,
          subtractFee:true,
          commentTo:"",
          commentFrom:"",
          amount:getCoreWalletBalance
        }
        const sendTransactionToMasterWallet=await this.sendTransaction(sendTransactionDto)
      if (sendTransactionToMasterWallet.error)
        console.log(`Transaction Failed...!`);

      console.log(sendTransactionToMasterWallet.result);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkPendingTransactions()
  {
    const findPendingTransactions=await this.dogePendingTransactionRepo.find()
    for (let pendingTransactions of findPendingTransactions) {
      const checkTransaction:CheckTransactionResponse=await this.checkTransaction(pendingTransactions.txid)

      if (checkTransaction.confirmations>0)
      {
        const transactionDetail=checkTransaction.details[0]
        if (transactionDetail.category=="receive")
        {
          const findReceivedTransaction=await this.dogeReceiveTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
          if (findReceivedTransaction)
          {
            findReceivedTransaction.confirmations=checkTransaction.confirmations
            const savedReceivedTransaction=await this.dogeReceiveTransactionRepo.save(findReceivedTransaction)
            console.log(`this Receive transaction confirmation goes up txId: ${checkTransaction.txid}`);
          }
        if (!findReceivedTransaction)
        {
          const dogeReceiveTransactionEntity=new DogeReceiveTransactionEntity()
          dogeReceiveTransactionEntity.account=transactionDetail.account
          dogeReceiveTransactionEntity.address=transactionDetail.address
          dogeReceiveTransactionEntity.amount=transactionDetail.amount
          dogeReceiveTransactionEntity.confirmations=checkTransaction.confirmations
          dogeReceiveTransactionEntity.label=transactionDetail.label
          dogeReceiveTransactionEntity.receiveTime=checkTransaction.timereceived
          dogeReceiveTransactionEntity.time=checkTransaction.time
          dogeReceiveTransactionEntity.txid=checkTransaction.txid
          const saveReceivedTransaction=await this.dogeReceiveTransactionRepo.save(dogeReceiveTransactionEntity)
          console.log(`This Transaction Received...!  txId: ${checkTransaction.txid}`);
        }
        }

        if (transactionDetail.category=="send")
        {
          const findSendTransaction=await this.dogeSendTransactionRepo.findOne({where:{txid:checkTransaction.txid}})
            if (findSendTransaction)
            {
              findSendTransaction.confirmations=checkTransaction.confirmations
              const savedSendTransaction=await this.dogeSendTransactionRepo.save(findSendTransaction)
              console.log(`this send Transaction confirmation goes up  txId: ${checkTransaction.txid}`);
            }
        if (!findSendTransaction)
        {
          const dogeSendTransactionEntity=new DogeSendTransactionEntity()
          dogeSendTransactionEntity.address=transactionDetail.address
          dogeSendTransactionEntity.amount=transactionDetail.amount
          dogeSendTransactionEntity.category=transactionDetail.category
          dogeSendTransactionEntity.confirmations=checkTransaction.confirmations
          dogeSendTransactionEntity.fee=transactionDetail.fee
          dogeSendTransactionEntity.label=transactionDetail.label
          dogeSendTransactionEntity.receiveTime=checkTransaction.timereceived
          dogeSendTransactionEntity.time=checkTransaction.time
          dogeSendTransactionEntity.txid=checkTransaction.txid
          const saveSendTransaction=await this.dogeSendTransactionRepo.save(dogeSendTransactionEntity)
          console.log(`We lose some doge...!  txId: ${checkTransaction.txid}`);
        }
        }
      }
    }

  }
}