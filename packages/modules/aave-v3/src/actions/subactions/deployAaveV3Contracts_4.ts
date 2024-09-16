import { Address } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { SetPoolConfiguratorImplTxBuilder } from '@actions/subactions/tx-builders/poolAddressesProvider/setPoolConfiguratorImpl'
import { SetPoolImplTxBuilder } from '@actions/subactions/tx-builders/poolAddressesProvider/setPoolImpl'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'

export type DeployAaveV3Contracts_4SubActionParams = {
  poolAddressesProvider: Address
  poolImpl: Address
  poolConfiguratorImpl: Address
}

export type DeployAaveV3Contracts_4SubActionMsg = {
  poolProxy: Address
  poolConfiguratorProxy: Address
}

export class DeployAaveV3Contracts_4SubAction extends SubAction<
  DeployAaveV3Contracts_4SubActionParams,
  AaveV3Registry,
  DeployAaveV3Contracts_4SubActionMsg
> {
  constructor(client: InfinitWallet, params: DeployAaveV3Contracts_4SubActionParams) {
    super(DeployAaveV3Contracts_4SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // set pool impl & deploy pool proxy
    const setPoolImplSubAction = new SetPoolImplTxBuilder(this.client, {
      poolAddressProvider: this.params.poolAddressesProvider,
      poolImpl: this.params.poolImpl,
    })
    this.txBuilders.push(setPoolImplSubAction)

    // set pool configurator impl & deploy pool configurator proxy
    const setPoolConfiguratorImplSubAction = new SetPoolConfiguratorImplTxBuilder(this.client, {
      poolAddressProvider: this.params.poolAddressesProvider,
      poolConfiguratorImpl: this.params.poolConfiguratorImpl,
    })
    this.txBuilders.push(setPoolConfiguratorImplSubAction)
  }

  public async updateRegistryAndMessage(
    registry: AaveV3Registry,
  ): Promise<SubActionExecuteResponse<AaveV3Registry, DeployAaveV3Contracts_4SubActionMsg>> {
    const poolAddressesProviderArtifact = await readArtifact('PoolAddressesProvider')
    const poolProxy: Address = await this.client.publicClient.readContract({
      address: this.params.poolAddressesProvider,
      abi: poolAddressesProviderArtifact.abi,
      functionName: 'getPool',
      args: [],
    })
    registry['poolProxy'] = poolProxy

    const poolConfiguratorProxy: Address = await this.client.publicClient.readContract({
      address: this.params.poolAddressesProvider,
      abi: poolAddressesProviderArtifact.abi,
      functionName: 'getPoolConfigurator',
      args: [],
    })
    registry['poolConfiguratorProxy'] = poolConfiguratorProxy

    const newMessage = {
      poolProxy: poolProxy,
      poolConfiguratorProxy: poolConfiguratorProxy,
    }

    return { newRegistry: registry, newMessage: newMessage }
  }
}
