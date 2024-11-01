import { z } from 'zod'

import { Address } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import {
  SetApi3ProxyOracleReaderDataFeedProxiesSubAction,
  SetApi3ProxyOracleReaderDataFeedProxiesSubActionParams,
} from '@actions/subactions/setApi3ProxyOracleReaderDataFeedProxies'
import {
  SetApi3ProxyOracleReaderMaxStaleTimesSubAction,
  SetApi3ProxyOracleReaderMaxStaleTimesSubActionParams,
} from '@actions/subactions/setApi3ProxyOracleReaderMaxStaleTimes'

import { InitCapitalRegistry } from '@/src/type'

type TokenInfo = {
  token: Address
  dataFeedProxy: Address
  maxStaleTime: bigint
}

export const SetApi3ProxyOracleReaderTokensInfoActionParamsSchema = z.object({
  api3ProxyOracleReader: zodAddress.describe(`Address of API3 proxy oracle reader e.g. '0x123...abc'`),
  tokensInfo: z.array(
    z.object({
      token: zodAddress.describe(`Address of tokenInfo e.g. '0x123...abc'`),
      dataFeedProxy: zodAddress.describe(`Address of data feed proxy e.g. '0x123...abc'`),
      maxStaleTime: z.bigint().describe(`Max stale time in seconds e.g. 86400n for 1 day`),
    }),
  ) satisfies z.ZodType<TokenInfo[]>,
})

export type SetApi3ProxyOracleReaderTokensInfoActionParams = z.infer<typeof SetApi3ProxyOracleReaderTokensInfoActionParamsSchema>

export type SetApi3ProxyOracleReaderTokensInfoActionData = {
  params: SetApi3ProxyOracleReaderTokensInfoActionParams
  signer: Record<'governor', InfinitWallet>
}

export class SetApi3ProxyOracleReaderTokensInfoAction extends Action<SetApi3ProxyOracleReaderTokensInfoActionData, InitCapitalRegistry> {
  constructor(data: SetApi3ProxyOracleReaderTokensInfoActionData) {
    validateActionData(data, SetApi3ProxyOracleReaderTokensInfoActionParamsSchema, ['governor'])
    super(SetApi3ProxyOracleReaderTokensInfoAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const governor = this.data.signer['governor']
    const tokens: Address[] = []
    const dataFeedProxies: Address[] = []
    const maxStaleTimes: bigint[] = []

    // extract tokens, data feed proxies and max stale times from params
    for (const tokenInfo of this.data.params.tokensInfo) {
      tokens.push(tokenInfo.token)
      dataFeedProxies.push(tokenInfo.dataFeedProxy)
      maxStaleTimes.push(tokenInfo.maxStaleTime)
    }

    // set tokens data feed proxies params
    const setApi3ProxyOracleReaderDataFeedProxiesSubActionParams: SetApi3ProxyOracleReaderDataFeedProxiesSubActionParams = {
      api3ProxyOracleReader: this.data.params.api3ProxyOracleReader,
      tokens: tokens,
      dataFeedProxies: dataFeedProxies,
    }
    // set tokens max stale times params
    const setApi3ProxyOracleReaderMaxStaleTimesSubActionParams: SetApi3ProxyOracleReaderMaxStaleTimesSubActionParams = {
      api3ProxyOracleReader: this.data.params.api3ProxyOracleReader,
      tokens: tokens,
      maxStaleTimes: maxStaleTimes,
    }

    // return subactions
    return [
      new SetApi3ProxyOracleReaderDataFeedProxiesSubAction(governor, setApi3ProxyOracleReaderDataFeedProxiesSubActionParams),
      new SetApi3ProxyOracleReaderMaxStaleTimesSubAction(governor, setApi3ProxyOracleReaderMaxStaleTimesSubActionParams),
    ]
  }
}
