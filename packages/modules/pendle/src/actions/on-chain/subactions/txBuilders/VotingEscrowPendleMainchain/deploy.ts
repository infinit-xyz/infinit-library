import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployVotingEscrowPendleMainchainTxBuilderParams = {
  pendle: Address
  pendleMsgSendEndpoint: Address
  initialApproxDestinationGas: bigint
}
export class DeployVotingEscrowPendleMainchainTxBuilder extends TxBuilder {
  public pendle: Address
  public pendleMsgSendEndpoint: Address
  public initialApproxDestinationGas: bigint

  constructor(client: InfinitWallet, params: DeployVotingEscrowPendleMainchainTxBuilderParams) {
    super(DeployVotingEscrowPendleMainchainTxBuilder.name, client)
    this.pendle = getAddress(params.pendle)
    this.pendleMsgSendEndpoint = getAddress(params.pendleMsgSendEndpoint)
    this.initialApproxDestinationGas = params.initialApproxDestinationGas
  }

  async buildTx(): Promise<TransactionData> {
    const VotingEscrowPendleMainchainArtifact = await readArtifact('VotingEscrowPendleMainchain')

    const deployData: Hex = encodeDeployData({
      abi: VotingEscrowPendleMainchainArtifact.abi,
      bytecode: VotingEscrowPendleMainchainArtifact.bytecode,
      args: [this.pendle, this.pendleMsgSendEndpoint, this.initialApproxDestinationGas],
    })
    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.pendle === zeroAddress) throw new ValidateInputZeroAddressError('PENDLE')
    if (this.pendleMsgSendEndpoint === zeroAddress) throw new ValidateInputZeroAddressError('PENDLE_MSG_SEND_ENDPOINT')
  }
}
