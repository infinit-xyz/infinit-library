import { Address, Hex, encodeDeployData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployUiPoolDataProviderV3Params = {
  networkBaseTokenPriceInUsdProxyAggregator: Address
  marketReferenceCurrencyPriceInUsdProxyAggregator: Address
}

export class DeployUiPoolDataProviderV3TxBuilder extends TxBuilder {
  private networkBaseTokenPriceInUsdProxyAggregator: Address
  private marketReferenceCurrencyPriceInUsdProxyAggregator: Address
  constructor(client: InfinitWallet, params: DeployUiPoolDataProviderV3Params) {
    super(DeployUiPoolDataProviderV3TxBuilder.name, client)
    this.networkBaseTokenPriceInUsdProxyAggregator = params.networkBaseTokenPriceInUsdProxyAggregator
    this.marketReferenceCurrencyPriceInUsdProxyAggregator = params.marketReferenceCurrencyPriceInUsdProxyAggregator
  }

  async buildTx(): Promise<TransactionData> {
    const uiPoolDataProviderV3 = await readArtifact('UiPoolDataProviderV3')

    const deployData = encodeDeployData({
      abi: uiPoolDataProviderV3.abi,
      bytecode: uiPoolDataProviderV3.bytecode as Hex,
      args: [this.networkBaseTokenPriceInUsdProxyAggregator, this.marketReferenceCurrencyPriceInUsdProxyAggregator],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
