import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployQuoterV2Params = {
  factory: Address
  weth9: Address
}

export class DeployQuoterV2TxBuilder extends TxBuilder {
  private factory: Address
  private weth9: Address

  constructor(client: InfinitWallet, params: DeployQuoterV2Params) {
    super(DeployQuoterV2TxBuilder.name, client)
    this.factory = getAddress(params.factory)
    this.weth9 = getAddress(params.weth9)
  }

  async buildTx(): Promise<TransactionData> {
    const quoterV2Artifact = await readArtifact('swap-router-contracts/lens/QuoterV2.sol:QuoterV2')

    const deployData: Hex = encodeDeployData({
      abi: quoterV2Artifact.abi,
      bytecode: quoterV2Artifact.bytecode as Hex,
      args: [this.factory, this.weth9],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  async validate(): Promise<void> {
    if (this.factory === zeroAddress) throw new ValidateInputValueError('Factory cannot be zero address')
    if (this.weth9 === zeroAddress) throw new ValidateInputValueError('weth9 cannot be zero address')
  }
}
