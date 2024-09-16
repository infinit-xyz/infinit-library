import { Address, Hex, encodeDeployData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployATokenParams = {
  pool: Address
}

export class DeployATokenTxBuilder extends TxBuilder {
  private pool: Address

  constructor(client: InfinitWallet, params: DeployATokenParams) {
    super(DeployATokenTxBuilder.name, client)
    this.pool = params.pool
  }

  async buildTx(): Promise<TransactionData> {
    const aTokenArtifact = await readArtifact('AToken')

    const deployData: Hex = encodeDeployData({ abi: aTokenArtifact.abi, bytecode: aTokenArtifact.bytecode as Hex, args: [this.pool] })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public validate(): any {}
}
