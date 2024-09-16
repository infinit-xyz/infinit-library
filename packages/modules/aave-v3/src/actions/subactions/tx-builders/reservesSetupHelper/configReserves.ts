import type { Address } from 'viem'
import { encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type ConfigureReserveInput = {
  asset: Address
  baseLTV: bigint
  liquidationThreshold: bigint
  liquidationBonus: bigint
  reserveFactor: bigint
  borrowCap: bigint
  supplyCap: bigint
  stableBorrowingEnabled: boolean
  borrowingEnabled: boolean
  flashLoanEnabled: boolean
}

export type ConfigureReservesTxBuilderParams = {
  reservesSetupHelper: Address
  poolConfigurator: Address
  inputs: ConfigureReserveInput[]
}

export class ConfigureReservesTxBuilder extends TxBuilder {
  private reservesSetupHelper: Address
  private poolConfigurator: Address
  private inputParams: ConfigureReserveInput[]

  constructor(client: InfinitWallet, params: ConfigureReservesTxBuilderParams) {
    super(ConfigureReservesTxBuilder.name, client)
    this.poolConfigurator = getAddress(params.poolConfigurator)
    this.inputParams = params.inputs.map(({ asset, ...rest }) => {
      return { asset: getAddress(asset), ...rest }
    })
    this.reservesSetupHelper = getAddress(params.reservesSetupHelper)
  }

  async buildTx(): Promise<TransactionData> {
    const reservesSetupHelperArtifact = await readArtifact('ReservesSetupHelper')

    const callData = encodeFunctionData({
      abi: reservesSetupHelperArtifact.abi,
      functionName: 'configureReserves',
      args: [this.poolConfigurator, this.inputParams],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.reservesSetupHelper,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
