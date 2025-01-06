import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetDefaultApproxParamsTxBuilderParams = {
  pendleRouterStatic: Address
  approxParams: ApproxParams
}

export type ApproxParams = {
  guessMin: bigint
  guessMax: bigint
  guessOffchain: bigint
  maxIteration: bigint
  eps: bigint
}

export class SetDefaultApproxParamsTxBuilder extends TxBuilder {
  pendleRouterStatic: Address
  approxParams: ApproxParams

  constructor(client: InfinitWallet, params: SetDefaultApproxParamsTxBuilderParams) {
    super(SetDefaultApproxParamsTxBuilder.name, client)
    this.pendleRouterStatic = getAddress(params.pendleRouterStatic)
    this.approxParams = params.approxParams
  }

  async buildTx(): Promise<TransactionData> {
    const actionStorageStaticArtifact = await readArtifact('ActionStorageStatic')

    const callData = encodeFunctionData({
      abi: actionStorageStaticArtifact.abi,
      functionName: 'setDefaultApproxParams',
      args: [this.approxParams],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.pendleRouterStatic,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.pendleRouterStatic === zeroAddress) {
      throw new ValidateInputZeroAddressError('PendleRouterStatic')
    }
  }
}
