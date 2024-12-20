import { Address, Hex, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPendleVotingContollerUpgTxBuilderParams = {
  vePendle: Address
  pendleMsgSendEndpoint: Address
  initialApproxDestinationGas: bigint
}

export class DeployPendleVotingControllerUpgTxBuilder extends TxBuilder {
  public vePendle: Address
  public pendleMsgSendEndpoint: Address
  public initialApproxDestinationGas: bigint

  constructor(client: InfinitWallet, params: DeployPendleVotingContollerUpgTxBuilderParams) {
    super(DeployPendleVotingControllerUpgTxBuilder.name, client)

    this.vePendle = getAddress(params.vePendle)
    this.pendleMsgSendEndpoint = getAddress(params.pendleMsgSendEndpoint)
    this.initialApproxDestinationGas = params.initialApproxDestinationGas
  }

  async buildTx(): Promise<TransactionData> {
    const pendleVotingControllerUpgArtifact = await readArtifact('PendleVotingControllerUpg')

    const deployData: Hex = encodeDeployData({
      abi: pendleVotingControllerUpgArtifact.abi,
      bytecode: pendleVotingControllerUpgArtifact.bytecode,
      args: [this.vePendle, this.pendleMsgSendEndpoint, this.initialApproxDestinationGas],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
