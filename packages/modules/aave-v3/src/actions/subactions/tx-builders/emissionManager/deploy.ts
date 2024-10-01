import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployEmissionManagerParams = {
  owner: Address
}

export class DeployEmissionManagerTxBuilder extends TxBuilder {
  owner: Address

  constructor(client: InfinitWallet, params: DeployEmissionManagerParams) {
    super(DeployEmissionManagerTxBuilder.name, client)
    this.owner = getAddress(params.owner)
  }

  async buildTx(): Promise<TransactionData> {
    const emissionManagerArtifact = await readArtifact('EmissionManager')

    const deployData: Hex = encodeDeployData({
      abi: emissionManagerArtifact.abi,
      bytecode: emissionManagerArtifact.bytecode,
      args: [this.owner],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.owner === zeroAddress) throw new ValidateInputValueError('owner zero address')
  }
}
