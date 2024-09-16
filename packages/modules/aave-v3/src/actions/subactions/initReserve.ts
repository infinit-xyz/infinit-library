import _ from 'lodash'

import { Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { InitReserveTxBuilder, InitReserveTxBuilderParams } from '@actions/subactions/tx-builders/reservesSetupHelper/initReserve'

import { AaveV3Registry, LendingPool } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'

export type InitReserveSubActionParams = InitReserveTxBuilderParams

export class InitReserveSubAction extends SubAction<InitReserveSubActionParams, AaveV3Registry, Object> {
  constructor(client: InfinitWallet, params: InitReserveSubActionParams) {
    super(InitReserveSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // add init reserve tx builder
    const txBuilder = new InitReserveTxBuilder(this.client, this.params)
    this.txBuilders.push(txBuilder)
  }

  protected async updateRegistryAndMessage(
    registry: AaveV3Registry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<AaveV3Registry, {}>> {
    // update registry mapping name from txHashes
    for (const index in this.params.inputs) {
      const underlyingToken = this.params.inputs[index].underlyingAsset
      const [poolArtifact, erc20Artifact] = await Promise.all([readArtifact('Pool'), readArtifact('ERC20')])

      // get reserve data on chain
      const reserveData = await this.client.publicClient.readContract({
        address: this.params.pool,
        abi: poolArtifact.abi,
        functionName: 'getReserveData',
        args: [underlyingToken],
      })

      // create lending pool info
      const lendingPool: LendingPool = {
        underlyingToken: underlyingToken,
        interestRateStrategy: this.params.inputs[index].interestRateStrategyAddress,
        aToken: reserveData.aTokenAddress,
        stableDebtToken: reserveData.stableDebtTokenAddress,
        variableDebtToekn: reserveData.variableDebtTokenAddress,
      }

      // get underlying token symbol
      const symbol = await this.client.publicClient.readContract({
        address: underlyingToken,
        abi: erc20Artifact.abi,
        functionName: 'symbol',
        args: [],
      })

      _.set(registry, ['lendingPools', symbol], lendingPool)
    }
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
