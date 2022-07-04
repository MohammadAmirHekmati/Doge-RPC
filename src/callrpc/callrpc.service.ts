import { Injectable } from '@nestjs/common';
import {RpcClientOptions} from "jsonrpc-ts";

@Injectable()
export class CallrpcService {
    async getDogeRpcOptions():Promise<RpcClientOptions>
    {
        // Set your Fullnode Host address
        const HOST=""
        // Set your port 
        const PORT=12315640

        const dogeRpcOptions:RpcClientOptions=
            {
                  // Set username and password of your RPC server
        auth:{username:"",password:""}, 
        headers:{"content-type": "text/plain;"},
        timeout:60000,
        url:`http://${HOST}:${PORT}`,
        method:"post"
            }

        return dogeRpcOptions
    }

    async walletOptions():Promise<WalletOptions>
    {
      const walletOptions:WalletOptions=
        {
           // Set Target Wallet
        target_wallet:"",
        // Set the password of the wallet on fullnode
        wallet_pass:""
        }

        return walletOptions
    }
}

export class WalletOptions {
  wallet_pass:string
  target_wallet:string
}