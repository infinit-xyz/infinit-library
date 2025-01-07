import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPendleVotingControllerUpgTxBuilderParams = {
  vePendle: Address
  pendleMsgSendEndpoint: Address
  initialApproxDestinationGas: bigint
}

export class DeployPendleVotingControllerUpgTxBuilder extends TxBuilder {
  public vePendle: Address
  public pendleMsgSendEndpoint: Address
  public initialApproxDestinationGas: bigint

  constructor(client: InfinitWallet, params: DeployPendleVotingControllerUpgTxBuilderParams) {
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

  public async validate(): Promise<void> {
    if (this.vePendle === zeroAddress) throw new ValidateInputZeroAddressError('VE_PENDLE')
    if (this.pendleMsgSendEndpoint === zeroAddress) throw new ValidateInputZeroAddressError('PENDLE_MSG_SEND_ENDPOINT')
  }
}
