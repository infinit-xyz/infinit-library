import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import {
  SetMinLiqIncentiveMultiplierE18TxBuilder,
  SetMinLiqIncentiveMultiplierE18TxBuilderParams,
} from '@actions/subactions/tx-builders/LiqIncentiveCalculator/setMinLiqIncentiveMultiplier_e18'
import {
  SetModeLiqIncentiveMultiplierE18TxBuilder,
  SetModeLiqIncentiveMultiplierE18TxBuilderParams,
} from '@actions/subactions/tx-builders/LiqIncentiveCalculator/setModeLiqIncentiveMultiplier_e18'
import {
  SetTokenLiqIncentiveMultiplierE18TxBuilder,
  SetTokenLiqIncentiveMultiplierE18TxBuilderParams,
} from '@actions/subactions/tx-builders/LiqIncentiveCalculator/setTokenLiqIncentiveMulitiplier_e18'

import { InitCapitalRegistry } from '@/src/type'
import { readArtifact } from '@utils/artifact'

export type ModeLiqIncentiveMultiplierConfig = {
  mode: number
  config?: {
    liqIncentiveMultiplier_e18: bigint
    minLiqIncentiveMultiplier_e18: bigint
  }
}

export type TokenLiqIncentiveMultiplierConfig = {
  token: Address
  multiplier_e18?: bigint
}

export type SetModeAndTokenLiqMultiplierSubActionParams = {
  liqIncentiveCalculator: Address
  tokenLiqIncentiveMultiplierConfig: TokenLiqIncentiveMultiplierConfig
  modeLiqIncentiveMultiplierConfigs: ModeLiqIncentiveMultiplierConfig[]
}

export class SetModeAndTokenLiqMultiplierSubAction extends SubAction<SetModeAndTokenLiqMultiplierSubActionParams, InitCapitalRegistry> {
  constructor(client: InfinitWallet, params: SetModeAndTokenLiqMultiplierSubActionParams) {
    super(SetModeAndTokenLiqMultiplierSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // set token liquidation incentive multiplier
    // run only token multiplier is set
    const multiplier = this.params.tokenLiqIncentiveMultiplierConfig.multiplier_e18
    if (multiplier) {
      const setTokenLiqIncentiveMultiplierParams: SetTokenLiqIncentiveMultiplierE18TxBuilderParams = {
        liqIncentiveCalculator: this.params.liqIncentiveCalculator,
        tokens: [this.params.tokenLiqIncentiveMultiplierConfig.token],
        multipliers_e18: [multiplier],
      }

      const setTokenLiqIncentiveMultiplierTxBuilder = new SetTokenLiqIncentiveMultiplierE18TxBuilder(
        this.client,
        setTokenLiqIncentiveMultiplierParams,
      )
      this.txBuilders.push(setTokenLiqIncentiveMultiplierTxBuilder)
    }

    // set mode's liquidation incentive multiplier
    const modeLiqMultipliers = this.params.modeLiqIncentiveMultiplierConfigs.map(
      (modeLiqConfig) => modeLiqConfig.config?.liqIncentiveMultiplier_e18,
    )
    if (modeLiqMultipliers.every((multiplier) => multiplier !== undefined)) {
      const setModeLiqIncentiveMultiplierParams: SetModeLiqIncentiveMultiplierE18TxBuilderParams = {
        liqIncentiveCalculator: this.params.liqIncentiveCalculator,
        modes: this.params.modeLiqIncentiveMultiplierConfigs.map((modeLiqConfig) => modeLiqConfig.mode),
        multipliers_e18: modeLiqMultipliers,
      }
      const setModeLiqIncentiveMultiplierTxBuilder = new SetModeLiqIncentiveMultiplierE18TxBuilder(
        this.client,
        setModeLiqIncentiveMultiplierParams,
      )
      this.txBuilders.push(setModeLiqIncentiveMultiplierTxBuilder)
    }
    // set mode's min liquidation incentive multiplier
    const minLiqMultipliers = this.params.modeLiqIncentiveMultiplierConfigs.map(
      (modeLiqConfig) => modeLiqConfig.config?.minLiqIncentiveMultiplier_e18,
    )
    if (minLiqMultipliers.every((multiplier) => multiplier !== undefined)) {
      const setMinLiqIncentiveMultiplierParams: SetMinLiqIncentiveMultiplierE18TxBuilderParams = {
        liqIncentiveCalculator: this.params.liqIncentiveCalculator,
        modes: this.params.modeLiqIncentiveMultiplierConfigs.map((modeLiqConfig) => modeLiqConfig.mode),
        minMultipliers_e18: minLiqMultipliers,
      }
      const setMinLiqIncentiveMultiplierTxBuilder = new SetMinLiqIncentiveMultiplierE18TxBuilder(
        this.client,
        setMinLiqIncentiveMultiplierParams,
      )
      this.txBuilders.push(setMinLiqIncentiveMultiplierTxBuilder)
    }
  }

  protected override async internalValidate(_registry?: InitCapitalRegistry): Promise<void> {
    // read artifact
    const liqIncentiveCalculatorArtifact = await readArtifact('LiqIncentiveCalculator')
    // check if token parameter has already been set
    const token = this.params.tokenLiqIncentiveMultiplierConfig.token
    const multiplier = this.params.tokenLiqIncentiveMultiplierConfig.multiplier_e18
    const liqIncentiveMultiplier = await this.client.publicClient.readContract({
      address: this.params.liqIncentiveCalculator,
      abi: liqIncentiveCalculatorArtifact.abi,
      functionName: 'tokenLiqIncentiveMultiplier_e18',
      args: [token],
    })
    if (multiplier && liqIncentiveMultiplier > 0n) {
      throw new ContractValidateError('Token Liquidation Incentive Multiplier already set')
    }
    // check if modes parameter is set
    for (const modeLiqIncentiveMultiplierConfig of this.params.modeLiqIncentiveMultiplierConfigs) {
      // check if mode config is already set
      if (modeLiqIncentiveMultiplierConfig.config) {
        const modeMinLiqIncentiveMultiplier = await this.client.publicClient.readContract({
          address: this.params.liqIncentiveCalculator,
          abi: liqIncentiveCalculatorArtifact.abi,
          functionName: 'minLiqIncentiveMultiplier_e18',
          args: [modeLiqIncentiveMultiplierConfig.mode],
        })
        if (modeMinLiqIncentiveMultiplier > 0n) throw new ContractValidateError('Min Liquidation Incentive Multiplier already set')
        const modeLiqIncentiveMultiplier = await this.client.publicClient.readContract({
          address: this.params.liqIncentiveCalculator,
          abi: liqIncentiveCalculatorArtifact.abi,
          functionName: 'minLiqIncentiveMultiplier_e18',
          args: [modeLiqIncentiveMultiplierConfig.mode],
        })
        if (modeLiqIncentiveMultiplier > 0n) throw new ContractValidateError('Mode Liquidation Incentive Multiplier already set')
      }
    }
  }

  protected async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    _txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry>> {
    return {
      newRegistry: registry,
      newMessage: {},
    }
  }
}
