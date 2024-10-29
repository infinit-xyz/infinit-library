import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeMoneyMarketHookTxBuilderParams = {
  moneyMarketHook: Address
  logic: Address
  admin: Address
}

export class InitializeMoneyMarketHookTxBuilder extends TxBuilder {
  private moneyMarketHook: Address
  private logic: Address
  private admin: Address

  constructor(client: InfinitWallet, params: InitializeMoneyMarketHookTxBuilderParams) {
    super(InitializeMoneyMarketHookTxBuilder.name, client)
    this.moneyMarketHook = getAddress(params.moneyMarketHook)
    this.logic = getAddress(params.logic)
    this.admin = getAddress(params.admin)
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
    if (this.moneyMarketHook === zeroAddress) throw new ValidateInputZeroAddressError('MONEY_MARKET_HOOK_CANNOT_BE_ZERO_ADDRESS')
    if (this.logic === zeroAddress) throw new ValidateInputZeroAddressError('LOGIC_CANNOT_BE_ZERO_ADDRESS')
    if (this.admin === zeroAddress) throw new ValidateInputZeroAddressError('ADMIN_CANNOT_BE_ZERO_ADDRESS')
  }
}
