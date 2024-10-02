import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ValueNotFoundError } from '@infinit-xyz/core/errors'

import {
  SetReserveInterestRateStrategyAddressTxBuilder,
  SetReserveInterestRateStrategyAddressTxBuilderParams,
} from '@actions/subactions/tx-builders/poolConfigurator/setReserveInterestRateStrategyAddress'
import { getReserveData } from '@actions/subactions/tx-builders/utils'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'

export type InterestRateStrategyAddressInfo = {
  asset: Address
  interestRateStrategy: Address
}

export type SetInterestRateStrategyAddressSubActionParams = {
  interestRateStrategyAddressInfos: InterestRateStrategyAddressInfo[]
  poolConfigurator: Address
  pool: Address
  aclManager: Address
}

export class SetInterestRateStrategyAddressSubAction extends SubAction<
  SetInterestRateStrategyAddressSubActionParams,
  AaveV3Registry,
  object
> {
  constructor(client: InfinitWallet, params: SetInterestRateStrategyAddressSubActionParams) {
    super(SetInterestRateStrategyAddressSubAction.name, client, params)
  }

  public override async internalValidate(registry: AaveV3Registry): Promise<void> {
    // find params in registry.lendingPools
    if (!registry.lendingPools) {
      throw new ValueNotFoundError('lendingPools not found in registry')
    }
    // create set of underlyingTokens
    const underlyingTokens = new Set<Address>()
    for (const lendingPool of Object.values(registry.lendingPools)) {
      underlyingTokens.add(lendingPool.underlyingToken)
    }
    // check if all token in params are in the set
    for (const info of this.params.interestRateStrategyAddressInfos) {
      if (!underlyingTokens.has(info.asset)) {
        throw new ValueNotFoundError(`asset: ${info.asset} not found in registry`)
      }
    }
  }

  protected setTxBuilders(): void {
    for (const reserveFreezeInfo of this.params.interestRateStrategyAddressInfos) {
      const txBuilderParams: SetReserveInterestRateStrategyAddressTxBuilderParams = {
        asset: reserveFreezeInfo.asset,
        poolConfigurator: this.params.poolConfigurator,
        pool: this.params.pool,
        aclManager: this.params.aclManager,
        interestRateStrategy: reserveFreezeInfo.interestRateStrategy,
      }
      this.txBuilders.push(new SetReserveInterestRateStrategyAddressTxBuilder(this.client, txBuilderParams))
    }
  }

  protected async updateRegistryAndMessage(registry: AaveV3Registry, _txHashes: Hash[]): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    if (!registry.lendingPools) {
      throw new ValueNotFoundError('lendingPools not found in registry')
    }
    const poolArtifact = await readArtifact('Pool')
    for (const [key, lendingPool] of Object.entries(registry.lendingPools)) {
      const reserveData = await getReserveData(this.client, poolArtifact, this.params.pool, lendingPool.underlyingToken)
      registry.lendingPools[key].interestRateStrategy = reserveData.interestRateStrategyAddress
    }
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
