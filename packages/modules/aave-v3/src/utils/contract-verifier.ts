import { Address, PublicClient } from 'viem'

import { BaseContractVerifier, BlockExplorerParams, ContractInfo } from '@infinit-xyz/core/internal'

import { Artifacts } from 'hardhat/types'

import { AaveV3Registry, LendingPool } from '@/src/type'
import { getArtifacts } from '@/src/utils/artifact'

export class AaveV3ContractVerifier extends BaseContractVerifier<AaveV3Registry> {
  constructor(client: PublicClient, params: BlockExplorerParams) {
    super(client, params)
  }

  protected override async getContracts(registry: AaveV3Registry): Promise<ContractInfo[]> {
    const {
      lendingPools,
      reserveInterestRateStrategies,
      poolProxy,
      poolConfiguratorProxy,
      rewardsControllerProxy,
      api3Adapters,
      pythAdapters,
      bandAdapters,
      ...contractToAddressRegistry
    } = registry

    let contracts: ContractInfo[] = []

    for (const address of Object.values(contractToAddressRegistry)) {
      contracts.push({ address })
    }

    if (registry.poolAddressesProvider) {
      if (poolProxy) {
        contracts.push({
          address: poolProxy,
          constructorArgs: [registry.poolAddressesProvider],
        })
      }
      if (poolConfiguratorProxy) {
        contracts.push({
          address: poolConfiguratorProxy,
          constructorArgs: [registry.poolAddressesProvider],
        })
      }
    }

    if (lendingPools && registry.poolConfiguratorProxy) {
      const lendingPoolContractInfos = await this.getLendingPoolContractInfos(registry.poolConfiguratorProxy, lendingPools)
      contracts = contracts.concat(lendingPoolContractInfos)
    }

    if (reserveInterestRateStrategies) {
      const reserveInterestRateStrategyContractInfos = await this.getReserveInterestRateStrategyContractInfos(reserveInterestRateStrategies)
      contracts = contracts.concat(reserveInterestRateStrategyContractInfos)
    }

    if (api3Adapters) {
      const api3AdaptersContractInfos = await this.getAdapterContractInfos(api3Adapters)
      contracts = contracts.concat(api3AdaptersContractInfos)
    }

    if (pythAdapters) {
      const pythAdaptersContractInfos = await this.getAdapterContractInfos(pythAdapters)
      contracts = contracts.concat(pythAdaptersContractInfos)
    }

    if (bandAdapters) {
      const bandAdaptersContractInfos = await this.getAdapterContractInfos(bandAdapters)
      contracts = contracts.concat(bandAdaptersContractInfos)
    }

    return contracts
  }

  protected override async getArtifacts(): Promise<Artifacts> {
    const artifacts = await getArtifacts()

    return artifacts
  }

  private async getLendingPoolContractInfos(poolConfiguratorProxy: Address, lendingPools: Record<string, LendingPool>) {
    const contracts: ContractInfo[] = []
    for (const info of Object.values(lendingPools)) {
      for (const [contractName, address] of Object.entries(info)) {
        if (contractName === 'underlyingToken') continue
        contracts.push({
          address,
          constructorArgs: contractName !== 'interestRateStrategy' ? [poolConfiguratorProxy] : undefined,
        })
      }
    }
    return contracts
  }

  private async getReserveInterestRateStrategyContractInfos(reserveInterestRateStrategies: Record<string, Address>) {
    const contracts: ContractInfo[] = []
    for (const address of Object.values(reserveInterestRateStrategies)) {
      contracts.push({ address })
    }
    return contracts
  }

  private async getAdapterContractInfos(adapters: Record<string, Address>) {
    const contracts: ContractInfo[] = []
    for (const address of Object.values(adapters)) {
      contracts.push({ address })
    }
    return contracts
  }
}
