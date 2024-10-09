import { Address, PublicClient } from 'viem'

import { BaseContractVerifier, BlockExplorerParams, ContractInfo } from '@infinit-xyz/core/internal'

import { Artifacts } from 'hardhat/types'

import { TokenRegistry } from '@/src/type'
import { getArtifacts } from '@/src/utils/artifact'

export class TokenContractVerifier extends BaseContractVerifier<TokenRegistry> {
  constructor(client: PublicClient, params: BlockExplorerParams) {
    super(client, params)
  }

  protected override async getContracts(registry: TokenRegistry): Promise<ContractInfo[]> {
    const { accumulativeMerkleDistributors, tokens } = registry
    const contracts: ContractInfo[] = []

    if (tokens) {
      for (const address of Object.keys(tokens)) {
        contracts.push({ address: address as Address })
      }
    }
    if (accumulativeMerkleDistributors) {
      for (const [proxyAddress, { implementation }] of Object.entries(accumulativeMerkleDistributors)) {
        contracts.push({ address: proxyAddress as Address })
        contracts.push({ address: implementation })
      }
    }

    return contracts
  }

  protected override async getArtifacts(): Promise<Artifacts> {
    const artifacts = await getArtifacts()

    return artifacts
  }
}
