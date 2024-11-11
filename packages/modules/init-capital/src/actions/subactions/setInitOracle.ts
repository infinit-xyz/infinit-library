import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { SetMaxPriceDeviations_e18TxBuilder } from '@actions/subactions/tx-builders/InitOracle/setMaxPriceDeviations_e18'

import { SetPrimarySourcesTxBuilder } from './tx-builders/InitOracle/setPrimarySources'
import { SetSecondarySourcesTxBuilder } from './tx-builders/InitOracle/setSecondarySources'
import { InitCapitalRegistry } from '@/src/type'

export type TokenConfig = {
  token: Address
  primarySource?: Address | undefined
  secondarySource?: Address | undefined
  maxPriceDeviation_e18?: bigint | undefined
}

export type SetInitOracleConfigSubActionParams = {
  initOracle: Address
  tokenConfigs: TokenConfig[]
}
export class SetInitOracleConfigSubAction extends SubAction<SetInitOracleConfigSubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetInitOracleConfigSubActionParams) {
    super(SetInitOracleConfigSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // filter primarySources undefined out
    const primarySourcesFilteredParams = this.params.tokenConfigs.reduce((acc, tokenConfig) => {
      return tokenConfig.primarySource === undefined ? [...acc] : [...acc, tokenConfig]
    }, [] as TokenConfig[])
    if (primarySourcesFilteredParams.length > 0) {
      this.txBuilders.push(
        new SetPrimarySourcesTxBuilder(this.client, {
          initOracle: this.params.initOracle,
          tokens: primarySourcesFilteredParams.map((tokenConfig) => tokenConfig.token),
          sources: primarySourcesFilteredParams.map((tokenConfig) => tokenConfig.primarySource as Address),
        }),
      )
    }
    // filter secondarySources undefined out
    const secondarySourcesFilteredParams = this.params.tokenConfigs.reduce((acc, tokenConfig) => {
      return tokenConfig.secondarySource === undefined ? [...acc] : [...acc, tokenConfig]
    }, [] as TokenConfig[])
    if (secondarySourcesFilteredParams.length > 0) {
      this.txBuilders.push(
        new SetSecondarySourcesTxBuilder(this.client, {
          initOracle: this.params.initOracle,
          tokens: secondarySourcesFilteredParams.map((tokenConfig) => tokenConfig.token),
          sources: secondarySourcesFilteredParams.map((tokenConfig) => tokenConfig.secondarySource as Address),
        }),
      )
    }
    // filter maxPriceDeviations undefined out
    const maxPriceDeviationsFilteredParams = this.params.tokenConfigs.reduce((acc, tokenConfig) => {
      return tokenConfig.maxPriceDeviation_e18 === undefined ? [...acc] : [...acc, tokenConfig]
    }, [] as TokenConfig[])
    if (maxPriceDeviationsFilteredParams.length > 0) {
      this.txBuilders.push(
        new SetMaxPriceDeviations_e18TxBuilder(this.client, {
          initOracle: this.params.initOracle,
          tokens: maxPriceDeviationsFilteredParams.map((tokenConfig) => tokenConfig.token),
          maxPriceDeviations_e18s: maxPriceDeviationsFilteredParams.map((tokenConfig) => tokenConfig.maxPriceDeviation_e18 as bigint),
        }),
      )
    }
  }

  protected override async internalValidate(_registry?: InitCapitalRegistry): Promise<void> {
    for (const tokenConfig of this.params.tokenConfigs) {
      if (
        (tokenConfig.secondarySource && !tokenConfig.maxPriceDeviation_e18) ||
        (tokenConfig.maxPriceDeviation_e18 && !tokenConfig.secondarySource)
      ) {
        throw new ValidateInputValueError('Need to provide both secondary source and max price deviation if one of them is provided')
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
