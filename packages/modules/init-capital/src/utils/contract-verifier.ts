import { Address, PublicClient } from 'viem'

import { BaseContractVerifier, BlockExplorerParams, ContractInfo } from '@infinit-xyz/core/internal'

import { Artifacts } from 'hardhat/types'

import { InitCapitalRegistry } from '@/src/type'
import { getArtifacts } from '@/src/utils/artifact'

export class TokenContractVerifier extends BaseContractVerifier<InitCapitalRegistry> {
  constructor(client: PublicClient, params: BlockExplorerParams) {
    super(client, params)
  }

  protected override async getContracts(registry: InitCapitalRegistry): Promise<ContractInfo[]> {
    const { lendingPools, irms, ...contractToAddressRegistry } = registry
    const contracts: ContractInfo[] = []

    for (const address of Object.values(contractToAddressRegistry)) {
      contracts.push({ address })
    }

    if (lendingPools) {
      for (const { lendingPool, irm } of Object.values(lendingPools)) {
        contracts.push({ address: lendingPool })
        contracts.push({ address: irm })
      }
    }

    if (irms) {
      for (const address of Object.values(irms)) {
        contracts.push({ address })
      }
    }

    return contracts
  }

  protected override async getArtifacts(): Promise<Artifacts> {
    const artifacts = await getArtifacts()

    return artifacts
  }
}
