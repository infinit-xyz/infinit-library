import { Address, Hex, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployStableDebtTokenParams = {
  pool: Address
}

export class DeployStableDebtTokenTxBuilder extends TxBuilder {
  private pool: Address

  constructor(client: InfinitWallet, params: DeployStableDebtTokenParams) {
    super(DeployStableDebtTokenTxBuilder.name, client)
    this.pool = getAddress(params.pool)
  }

  async buildTx(): Promise<TransactionData> {
    const stableDebtTokenArtifact = await readArtifact('StableDebtToken')

    const deployData: Hex = encodeDeployData({
      abi: stableDebtTokenArtifact.abi,
      bytecode: stableDebtTokenArtifact.bytecode as Hex,
      args: [this.pool],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public validate(): any {}
}
