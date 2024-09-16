import { Address, Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployAaveEcosystemReserveV2Params = {
  treasuryOwner: Address
}

export class DeployAaveEcosystemReserveV2TxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployAaveEcosystemReserveV2TxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const aaveEcosystemReserveV2 = await readArtifact('AaveEcosystemReserveV2')

    // const deployData = encodeDeployData({abi: aaveEcosystemReserveV2.abi, bytecode: aaveEcosystemReserveV2.bytecode as Hex, args: [this.treasuryOwner]})
    const tx: TransactionData = {
      data: aaveEcosystemReserveV2.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
