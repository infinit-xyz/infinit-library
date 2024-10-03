import { PublicClient } from 'viem'

import { BaseContractVerifier, BlockExplorerParams, ContractInfo } from '@infinit-xyz/core/internal'

import { Artifacts } from 'hardhat/types'

import { UniswapV3Registry } from '@/src/type'
import { getArtifacts } from '@/src/utils/artifact'

export class UniswapV3ContractVerifier extends BaseContractVerifier<UniswapV3Registry> {
  constructor(client: PublicClient, params: BlockExplorerParams) {
    super(client, params)
  }

  protected override async getContracts(registry: UniswapV3Registry): Promise<ContractInfo[]> {
    const { pools, ...rest } = registry

    const contracts: ContractInfo[] = []

    for (const address of Object.values(rest)) {
      contracts.push({ address })
    }

    if (pools) {
      for (const pool of pools) {
        contracts.push({ address: pool, constructorArgs: [] })
      }
    }

    return contracts
  }

  protected override async getArtifacts(): Promise<Artifacts> {
    const artifacts = await getArtifacts()

    return artifacts
  }
}
