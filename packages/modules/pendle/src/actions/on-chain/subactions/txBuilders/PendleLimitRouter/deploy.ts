import { Address, Hex, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPendleLimitRouterParams = {
  wrappedNativeToken: Address
}

export class DeployPendleLimitRouterTxBuilder extends TxBuilder {
  private wrappedNativeToken: Address

  constructor(client: InfinitWallet, params: DeployPendleLimitRouterParams) {
    super(DeployPendleLimitRouterTxBuilder.name, client)
    this.wrappedNativeToken = getAddress(params.wrappedNativeToken)
  }

  async buildTx(): Promise<TransactionData> {
    const PendleLimitRouterArtifact = await readArtifact('PendleLimitRouter')

    const deployData: Hex = encodeDeployData({
      abi: PendleLimitRouterArtifact.abi,
      bytecode: PendleLimitRouterArtifact.bytecode as Hex,
      args: [this.wrappedNativeToken],
    })

    const tx: TransactionData = {
      data: deployData as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}