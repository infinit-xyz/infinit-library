import { Address, Hex, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPendleRouterV4Params = {
  owner: Address
  actionStorage: Address
}

export class DeployPendleRouterV4TxBuilder extends TxBuilder {
  private owner: Address
  private actionStorage: Address

  constructor(client: InfinitWallet, params: DeployPendleRouterV4Params) {
    super(DeployPendleRouterV4TxBuilder.name, client)
    this.owner = getAddress(params.owner)
    this.actionStorage = getAddress(params.actionStorage)
  }

  async buildTx(): Promise<TransactionData> {
    const PendleRouterV4Artifact = await readArtifact('PendleRouterV4')

    const deployData: Hex = encodeDeployData({
      abi: PendleRouterV4Artifact.abi,
      bytecode: PendleRouterV4Artifact.bytecode as Hex,
      args: [this.owner, this.actionStorage],
    })

    const tx: TransactionData = {
      data: deployData as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
