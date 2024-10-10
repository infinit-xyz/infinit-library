import { Address, encodeDeployData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployAggregatorApi3AdapterParams = {
  dataFeedProxy: Address
}

export class DeployAggregatorApi3AdapterTxBuilder extends TxBuilder {
  private dataFeedProxy: Address

  constructor(client: InfinitWallet, params: DeployAggregatorApi3AdapterParams) {
    super(DeployAggregatorApi3AdapterTxBuilder.name, client)
    this.dataFeedProxy = params.dataFeedProxy
  }

  async buildTx(): Promise<TransactionData> {
    const aggregatorApi3AdapterArtifact = await readArtifact('AggregatorApi3Adapter')

    const deployData = encodeDeployData({
      abi: aggregatorApi3AdapterArtifact.abi,
      bytecode: aggregatorApi3AdapterArtifact.bytecode,
      args: [this.dataFeedProxy],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.dataFeedProxy === zeroAddress) throw new ValidateInputValueError('DATA_FEED_PROXY_CANNOT_BE_ZERO_ADDRESS')
  }
}
