import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetAssetSourcesTxBuilderParams = {
  oracle: Address
  assets: Address[]
  sources: Address[]
}

export class SetAssetSourcesTxBuilder extends TxBuilder {
  private setAssetSourcesParams: SetAssetSourcesTxBuilderParams

  constructor(client: InfinitWallet, params: SetAssetSourcesTxBuilderParams) {
    super(SetAssetSourcesTxBuilder.name, client)
    this.setAssetSourcesParams = {
      oracle: getAddress(params.oracle),
      assets: params.assets.map((asset) => getAddress(asset)),
      sources: params.sources.map((source) => getAddress(source)),
    }
  }

  async buildTx(): Promise<TransactionData> {
    const aaveOracleArtifact = await readArtifact('AaveOracle')
    const params = this.setAssetSourcesParams

    const args: [Address[], Address[]] = [params.assets, params.sources]

    const functionData = encodeFunctionData({
      abi: aaveOracleArtifact.abi,
      functionName: 'setAssetSources',
      args: args,
    })

    const tx: TransactionData = {
      data: functionData,
      to: params.oracle,
    }

    return tx
  }

  public async validate(): Promise<void> {
    const params = this.setAssetSourcesParams
    // check array length
    if (params.assets.length !== params.sources.length) throw new ValidateInputValueError('MISMATCH_LENGTH')
    // check zero address
    for (const asset of params.assets) {
      if (asset === zeroAddress) throw new ValidateInputValueError('ASSET_SHOULD_NOT_BE_ZERO_ADDRESS')
    }
    for (const source of params.sources) {
      if (source === zeroAddress) throw new ValidateInputValueError('SOURCES_SHOULD_NOT_BE_ZERO_ADDRESS')
    }
  }
}
