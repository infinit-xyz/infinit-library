import { Address, Hex, encodeFunctionData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializePendleLimitRouterTxBuilderParams = {
  pendleLimitRouter: Address
  feeRecipient: Address
}
export class InitializePendleLimitRouterTxBuilder extends TxBuilder {
  public pendleLimitRouter: Address
  public feeRecipient: Address

  constructor(client: InfinitWallet, params: InitializePendleLimitRouterTxBuilderParams) {
    super(InitializePendleLimitRouterTxBuilder.name, client)
    this.pendleLimitRouter = params.pendleLimitRouter
    this.feeRecipient = params.feeRecipient
  }

  async buildTx(): Promise<TransactionData> {
    const pendleLimitRouterArtifact = await readArtifact('PendleLimitRouter')

    const functionData: Hex = encodeFunctionData({
      abi: pendleLimitRouterArtifact.abi,
      functionName: 'initialize',
      args: [this.feeRecipient],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.pendleLimitRouter,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.pendleLimitRouter === zeroAddress) throw new ValidateInputZeroAddressError('PENDLE_LIMIT_ROUTER')
    if (this.feeRecipient === zeroAddress) throw new ValidateInputZeroAddressError('FEE_RECIPIENT')
  }
}
