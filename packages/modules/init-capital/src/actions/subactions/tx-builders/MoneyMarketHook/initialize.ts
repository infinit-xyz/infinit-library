import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeMoneyMarketHookTxBuilderParams = {
  moneyMarketHook: Address
}

export class InitializeMoneyMarketHookTxBuilder extends TxBuilder {
  private moneyMarketHook: Address

  constructor(client: InfinitWallet, params: InitializeMoneyMarketHookTxBuilderParams) {
    super(InitializeMoneyMarketHookTxBuilder.name, client)
    this.moneyMarketHook = getAddress(params.moneyMarketHook)
  }

  async buildTx(): Promise<TransactionData> {
    const moneyMarketHookArtifact = await readArtifact('MoneyMarketHook')
    const functionData = encodeFunctionData({
      abi: moneyMarketHookArtifact.abi,
      functionName: 'initialize',
      args: [],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.moneyMarketHook,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.moneyMarketHook === zeroAddress) throw new ValidateInputZeroAddressError('MONEY_MARKET_HOOK')
  }
}
