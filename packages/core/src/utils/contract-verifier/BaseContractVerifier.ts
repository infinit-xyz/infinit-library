import { PublicClient } from 'viem'

import { Artifacts } from 'hardhat/types'

import { verifyContract } from './helper'
import { BlockExplorerParams, ContractInfo, ContractVerifierCallback } from './type'
import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan'

export abstract class BaseContractVerifier<R extends object> {
  protected client: PublicClient
  protected etherscan: Etherscan

  constructor(client: PublicClient, params: BlockExplorerParams) {
    const parsedApiKey = params.apiKey ?? '' // TODO: test that we can use default value

    this.etherscan = new Etherscan(parsedApiKey, params.apiUrl, params.url)
    this.client = client
  }

  protected abstract getContracts(registry: R): Promise<ContractInfo[]>

  protected abstract getArtifacts(): Promise<Artifacts>

  public async verify(registry: R, callback?: ContractVerifierCallback): Promise<void> {
    const contracts = await this.getContracts(registry)
    const artifacts = await this.getArtifacts()

    for (const contract of contracts) {
      await verifyContract(this.client, this.etherscan, artifacts, contract, callback)
    }
  }
}
