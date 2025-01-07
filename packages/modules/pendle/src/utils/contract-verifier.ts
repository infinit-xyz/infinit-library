import { Address, PublicClient } from 'viem'

import { BaseContractVerifier, BlockExplorerParams, ContractInfo } from '@infinit-xyz/core/internal'

import { Artifacts } from 'hardhat/types'

import { PendleRegistry } from '@/src/type'
import { getArtifacts, readArtifact } from '@/src/utils/artifact'

export class PendleContractVerifier extends BaseContractVerifier<PendleRegistry> {
  constructor(client: PublicClient, params: BlockExplorerParams) {
    super(client, params)
  }

  protected override async getContracts(registry: PendleRegistry): Promise<ContractInfo[]> {
    const contracts: ContractInfo[] = []

    const { pendleMarketFactoryV3, pendleYieldContractFactory, ...contractToAddressRegistry } = registry

    for (const address of Object.values(contractToAddressRegistry)) {
      contracts.push({ address })
    }

    if (pendleYieldContractFactory) {
      const pendleYieldContractFactoryArtifact = await readArtifact('PendleYieldContractFactory')
      const ytCreationCodeContractA: Address = await this.client.readContract({
        address: registry.pendleYieldContractFactory!,
        abi: pendleYieldContractFactoryArtifact.abi,
        functionName: 'ytCreationCodeContractA',
        args: [],
      })
      const ytCreationCodeSizeA: bigint = await this.client.readContract({
        address: registry.pendleYieldContractFactory!,
        abi: pendleYieldContractFactoryArtifact.abi,
        functionName: 'ytCreationCodeSizeA',
        args: [],
      })

      const ytCreationCodeContractB: Address = await this.client.readContract({
        address: registry.pendleYieldContractFactory!,
        abi: pendleYieldContractFactoryArtifact.abi,
        functionName: 'ytCreationCodeContractB',
        args: [],
      })
      const ytCreationCodeSizeB: bigint = await this.client.readContract({
        address: registry.pendleYieldContractFactory!,
        abi: pendleYieldContractFactoryArtifact.abi,
        functionName: 'ytCreationCodeSizeB',
        args: [],
      })

      contracts.push({
        address: pendleYieldContractFactory,
        constructorArgs: [ytCreationCodeContractA, ytCreationCodeSizeA, ytCreationCodeContractB, ytCreationCodeSizeB],
      })
    }

    if (pendleMarketFactoryV3) {
      const pendleMarketFactoryV3Artifact = await readArtifact('PendleMarketFactoryV3')
      const yieldContractFactory: Address = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'yieldContractFactory',
        args: [],
      })
      const marketCreationCodeContractA: Address = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'marketCreationCodeContractA',
        args: [],
      })
      const marketCreationCodeSizeA: bigint = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'marketCreationCodeSizeA',
        args: [],
      })
      const marketCreationCodeContractB: Address = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'marketCreationCodeContractB',
        args: [],
      })
      const marketCreationCodeSizeB: bigint = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'marketCreationCodeSizeB',
        args: [],
      })
      const treasury: Address = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'treasury',
        args: [],
      })
      const reserveFeePercent: number = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'reserveFeePercent',
        args: [],
      })
      const vePendle: Address = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'vePendle',
        args: [],
      })
      contracts.push({
        address: pendleMarketFactoryV3,
        constructorArgs: [
          yieldContractFactory,
          marketCreationCodeContractA,
          marketCreationCodeSizeA,
          marketCreationCodeContractB,
          marketCreationCodeSizeB,
          treasury,
          reserveFeePercent,
          vePendle,
          registry.pendleGaugeControllerMainchainUpgProxy!,
        ],
      })
    }

    return contracts
  }

  protected override async getArtifacts(): Promise<Artifacts> {
    const artifacts = await getArtifacts()

    return artifacts
  }
}
