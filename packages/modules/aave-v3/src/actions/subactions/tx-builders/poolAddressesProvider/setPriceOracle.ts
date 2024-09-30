import { Address, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type SetPriceOracleParams = {
  poolAddressesProvider: Address
  priceOracleSentinel: Address
}

export class SetPriceOracleTxBuilder extends TxBuilder {
  private poolAddressesProvider: Address
  private priceOracleSentinel: Address

  constructor(client: InfinitWallet, params: SetPriceOracleParams) {
    super(SetPriceOracleTxBuilder.name, client)
    this.poolAddressesProvider = getAddress(params.poolAddressesProvider)
    this.priceOracleSentinel = getAddress(params.priceOracleSentinel)
  }

  async buildTx(): Promise<TransactionData> {
    const providerArtifact = await readArtifact('PoolAddressesProvider')

    const callData = encodeFunctionData({ abi: providerArtifact.abi, functionName: 'setPriceOracle', args: [this.priceOracleSentinel] })

    const tx: TransactionData = {
      data: callData,
      to: this.poolAddressesProvider,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.poolAddressesProvider === zeroAddress) throw new ValidateInputValueError('pool address provider cannot be zero address')
  }
}
