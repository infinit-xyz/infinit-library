import { Address, Hex, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployL2EncoderParams = {
  poolProxy: Address
}

export class DeployL2EncoderTxBuilder extends TxBuilder {
  private poolProxy: Address

  constructor(client: InfinitWallet, params: DeployL2EncoderParams) {
    super(DeployL2EncoderTxBuilder.name, client)
    this.poolProxy = getAddress(params.poolProxy)
  }

  async buildTx(): Promise<TransactionData> {
    const l2EncoderArtifact = await readArtifact('L2Encoder')

    const deployData = encodeDeployData({ abi: l2EncoderArtifact.abi, bytecode: l2EncoderArtifact.bytecode as Hex, args: [this.poolProxy] })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // NOTE: poolProxy can be zeroAddress
  }
}
