import { Address, Hex, encodeDeployData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPendleMsgSendEndpointUpgTxBuilderParams = {
  refundAddress: Address
  lzEndpoint: Address
}
export class DeployPendleMsgSendEndpointUpgTxBuilder extends TxBuilder {
  public refundAddress: Address
  public lzEndpoint: Address

  constructor(client: InfinitWallet, params: DeployPendleMsgSendEndpointUpgTxBuilderParams) {
    super(DeployPendleMsgSendEndpointUpgTxBuilder.name, client)

    this.refundAddress = params.refundAddress
    this.lzEndpoint = params.lzEndpoint
  }

  async buildTx(): Promise<TransactionData> {
    const PendleMsgSendEndpointUpgArtifact = await readArtifact('PendleMsgSendEndpointUpg')

    const deployData: Hex = encodeDeployData({
      abi: PendleMsgSendEndpointUpgArtifact.abi,
      bytecode: PendleMsgSendEndpointUpgArtifact.bytecode,
      args: [this.refundAddress, this.lzEndpoint],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
