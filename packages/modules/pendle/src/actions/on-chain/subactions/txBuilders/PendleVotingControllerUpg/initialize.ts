import { Address, Hex, encodeFunctionData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializePendleVotingControllerUpgTxBuilderParams = {
  pendleVotingControllerUpg: Address
}

export class InitializePendleVotingControllerUpgTxBuilder extends TxBuilder {
  public pendleVotingControllerUpg: Address

  constructor(client: InfinitWallet, params: InitializePendleVotingControllerUpgTxBuilderParams) {
    super(InitializePendleVotingControllerUpgTxBuilder.name, client)
    this.pendleVotingControllerUpg = params.pendleVotingControllerUpg
  }

  async buildTx(): Promise<TransactionData> {
    const pendleVotingControllerUpgArtifact = await readArtifact('PendleVotingControllerUpg')

    const functionData: Hex = encodeFunctionData({
      abi: pendleVotingControllerUpgArtifact.abi,
      functionName: 'initialize',
      args: [],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.pendleVotingControllerUpg,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.pendleVotingControllerUpg === zeroAddress) throw new ValidateInputZeroAddressError('PENDLE_VOTING_CONTROLLER_UPG')
  }
}
