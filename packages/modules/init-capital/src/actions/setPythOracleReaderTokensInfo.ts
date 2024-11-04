import { z } from 'zod'

import { Address, Hex } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress, zodHex } from '@infinit-xyz/core/internal'

import {
  SetPythOracleReaderMaxStaleTimesSubAction,
  SetPythOracleReaderMaxStaleTimesSubActionParams,
} from '@actions/subactions/setPythOracleReaderMaxStaleTimes'
import {
  SetPythOracleReaderPriceIdsSubAction,
  SetPythOracleReaderPriceIdsSubActionParams,
} from '@actions/subactions/setPythOracleReaderPriceIds'

import { InitCapitalRegistry } from '@/src/type'

type TokenInfo = {
  token: Address
  priceId: Hex
  maxStaleTime: bigint
}

export const SetPythOracleReaderTokensInfoActionParamsSchema = z.object({
  pythOracleReaderProxy: zodAddress.describe(`Address of API3 proxy oracle reader e.g. '0x123...abc'`),
  tokensInfo: z.array(
    z.object({
      token: zodAddress.describe(`Address of tokenInfo e.g. '0x123...abc'`),
      priceId: zodHex.describe(`Pyth's priceId to use for fetching price`),
      maxStaleTime: z.bigint().describe(`Max stale time in seconds e.g. 86400n for 1 day`),
    }),
  ) satisfies z.ZodType<TokenInfo[]>,
})

export type SetPythOracleReaderTokensInfoActionParams = z.infer<typeof SetPythOracleReaderTokensInfoActionParamsSchema>

export type SetPythOracleReaderTokensInfoActionData = {
  params: SetPythOracleReaderTokensInfoActionParams
  signer: Record<'governor', InfinitWallet>
}

export class SetPythOracleReaderTokensInfoAction extends Action<SetPythOracleReaderTokensInfoActionData, InitCapitalRegistry> {
  constructor(data: SetPythOracleReaderTokensInfoActionData) {
    validateActionData(data, SetPythOracleReaderTokensInfoActionParamsSchema, ['governor'])
    super(SetPythOracleReaderTokensInfoAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const governor = this.data.signer['governor']
    const tokens: Address[] = []
    const dataFeedProxies: Hex[] = []
    const maxStaleTimes: bigint[] = []

    // extract tokens, data feed proxies and max stale times from params
    for (const tokenInfo of this.data.params.tokensInfo) {
      tokens.push(tokenInfo.token)
      dataFeedProxies.push(tokenInfo.priceId)
      maxStaleTimes.push(tokenInfo.maxStaleTime)
    }

    // set tokens data feed proxies params
    const setPythOracleReaderPriceIdsSubActionParams: SetPythOracleReaderPriceIdsSubActionParams = {
      pythOracleReader: this.data.params.pythOracleReaderProxy,
      tokens: tokens,
      priceIds: dataFeedProxies,
    }
    // set tokens max stale times params
    const setPythOracleReaderMaxStaleTimesSubActionParams: SetPythOracleReaderMaxStaleTimesSubActionParams = {
      pythOracleReader: this.data.params.pythOracleReaderProxy,
      tokens: tokens,
      maxStaleTimes: maxStaleTimes,
    }

    // return subactions
    return [
      new SetPythOracleReaderPriceIdsSubAction(governor, setPythOracleReaderPriceIdsSubActionParams),
      new SetPythOracleReaderMaxStaleTimesSubAction(governor, setPythOracleReaderMaxStaleTimesSubActionParams),
    ]
  }
}
