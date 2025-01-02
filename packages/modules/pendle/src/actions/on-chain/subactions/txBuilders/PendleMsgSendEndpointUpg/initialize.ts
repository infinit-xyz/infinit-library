import { Address, Hex, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type InitializePendleMsgSendEndpointUpgTxBuilderParams = {
  pendleMsgSendEndpointUpg: Address
}
export class InitializePendleMsgSendEndpointUpgTxBuilder extends TxBuilder {
  public pendleMsgSendEndpointUpg: Address

  constructor(client: InfinitWallet, params: InitializePendleMsgSendEndpointUpgTxBuilderParams) {
    super(InitializePendleMsgSendEndpointUpgTxBuilder.name, client)
    this.pendleMsgSendEndpointUpg = getAddress(params.pendleMsgSendEndpointUpg)
  }

  async buildTx(): Promise<TransactionData> {
    const PendleMsgSendEndpointUpgArtifact = await readArtifact('PendleMsgSendEndpointUpg')

    const deployData: Hex = encodeFunctionData({
      abi: PendleMsgSendEndpointUpgArtifact.abi,
      functionName: 'initialize',
      args: [],
    })

    const tx: TransactionData = {
      data: deployData,
      to: this.pendleMsgSendEndpointUpg,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
