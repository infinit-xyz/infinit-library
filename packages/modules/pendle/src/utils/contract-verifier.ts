import { PublicClient } from 'viem'

import { BaseContractVerifier, BlockExplorerParams, ContractInfo } from '@infinit-xyz/core/internal'

import { Artifacts } from 'hardhat/types'

import { PendleRegistry } from '@/src/type'
import { getArtifacts } from '@/src/utils/artifact'

export class TokenContractVerifier extends BaseContractVerifier<PendleRegistry> {
  constructor(client: PublicClient, params: BlockExplorerParams) {
    super(client, params)
  }

  protected override async getContracts(_registry: PendleRegistry): Promise<ContractInfo[]> {
    const contracts: ContractInfo[] = []

    return contracts
  }

  protected override async getArtifacts(): Promise<Artifacts> {
    const artifacts = await getArtifacts()

    return artifacts
  }
}
