import { Address, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeAaveEcosystemReserveV2Params = {
  treasury: Address
  fundsAdmin: Address
  aaveEcosystemReserveV2: Address
}

export class InitializeAaveEcosystemReserveV2TxBuilder extends TxBuilder {
  private fundsAdmin: Address
  private aaveEcosystemReserveV2: Address

  constructor(client: InfinitWallet, params: InitializeAaveEcosystemReserveV2Params) {
    super(InitializeAaveEcosystemReserveV2TxBuilder.name, client)
    this.aaveEcosystemReserveV2 = params.aaveEcosystemReserveV2
    this.fundsAdmin = params.fundsAdmin
  }

  async buildTx(): Promise<TransactionData> {
    const aaveEcosystemReserveV2 = await readArtifact('AaveEcosystemReserveV2')
    const callData = encodeFunctionData({ abi: aaveEcosystemReserveV2.abi, functionName: 'initialize', args: [this.fundsAdmin] })
    const tx: TransactionData = {
      data: callData,
      to: this.aaveEcosystemReserveV2,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}