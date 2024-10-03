import { PublicClient } from 'viem'

import { BlockExplorerParams, ContractVerifierCallback } from './type'
import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan'

export abstract class ContractVerifier<R extends object> {
  protected client: PublicClient
  protected etherscan: Etherscan

  constructor(client: PublicClient, params: BlockExplorerParams) {
    const parsedApiKey = params.apiKey ?? '' // TODO: test that we can use default value

    this.etherscan = new Etherscan(parsedApiKey, params.apiUrl, params.url)
    this.client = client
  }

  public abstract verify(registry: R, callback?: ContractVerifierCallback): Promise<void>
}
