import { z } from 'zod'

import { Address } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import {
  SetLsdApi3ProxyOracleReaderDataFeedProxiesSubAction,
  SetLsdApi3ProxyOracleReaderDataFeedProxiesSubActionParams,
} from '@actions/subactions/setLsdApi3ProxyOracleReaderDataFeedProxies'
import {
  SetLsdApi3ProxyOracleReaderMaxStaleTimesSubAction,
  SetLsdApi3ProxyOracleReaderMaxStaleTimesSubActionParams,
} from '@actions/subactions/setLsdApi3ProxyOracleReaderMaxStaleTimes'
import {
  SetLsdApi3ProxyOracleReaderQuoteTokensSubAction,
  SetLsdApi3ProxyOracleReaderQuoteTokensSubActionParams,
} from '@actions/subactions/setLsdApi3ProxyOracleReaderQuoteTokens'

import { InitCapitalRegistry } from '@/src/type'

type TokenInfo = {
  token: Address
  dataFeedProxy: Address
  quoteToken: Address
  maxStaleTime: bigint
}

export const SetLsdApi3ProxyOracleReaderTokensInfoActionParamsSchema = z.object({
  tokensInfo: z.array(
    z.object({
      token: zodAddress.describe(`Address of tokenInfo e.g. '0x123...abc'`),
      dataFeedProxy: zodAddress.describe(
        `Address of data feed proxy e.g. '0x123...abc', access https://market.api3.org to find the DataFeedProxy`,
      ),
      quoteToken: zodAddress.describe(`Address of the quote token e.g. '0x123...abc', where the address is weth for weeth`),
      maxStaleTime: z.bigint().describe(`Max stale time in seconds e.g. 86400n for 1 day`),
    }),
  ) satisfies z.ZodType<TokenInfo[]>,
})

export type SetLsdApi3ProxyOracleReaderTokensInfoActionParams = z.infer<typeof SetLsdApi3ProxyOracleReaderTokensInfoActionParamsSchema>

export type SetLsdApi3ProxyOracleReaderTokensInfoActionData = {
  params: SetLsdApi3ProxyOracleReaderTokensInfoActionParams
  signer: Record<'governor', InfinitWallet>
}

export class SetLsdApi3ProxyOracleReaderTokensInfoAction extends Action<
  SetLsdApi3ProxyOracleReaderTokensInfoActionData,
  InitCapitalRegistry
> {
  constructor(data: SetLsdApi3ProxyOracleReaderTokensInfoActionData) {
    validateActionData(data, SetLsdApi3ProxyOracleReaderTokensInfoActionParamsSchema, ['governor'])
    super(SetLsdApi3ProxyOracleReaderTokensInfoAction.name, data)
  }

  protected getSubActions(registry: InitCapitalRegistry): SubAction[] {
    const governor = this.data.signer['governor']
    const tokenInfos = this.data.params.tokensInfo
    const tokens = tokenInfos.map((tokenInfo) => tokenInfo.token)
    const dataFeedProxies = tokenInfos.map((tokenInfo) => tokenInfo.dataFeedProxy)
    const maxStaleTimes = tokenInfos.map((tokenInfo) => tokenInfo.maxStaleTime)
    const quoteTokens = tokenInfos.map((tokenInfo) => tokenInfo.quoteToken)

    if (!registry.lsdApi3ProxyOracleReaderProxy) throw new ValidateInputValueError('registry: lsdApi3ProxyOracleReaderProxy not found')

    // set tokens data feed proxies params
    const setLsdApi3ProxyOracleReaderDataFeedProxiesSubActionParams: SetLsdApi3ProxyOracleReaderDataFeedProxiesSubActionParams = {
      lsdApi3ProxyOracleReader: registry.lsdApi3ProxyOracleReaderProxy,
      tokens: tokens,
      dataFeedProxies: dataFeedProxies,
    }
    // set tokens max stale times params
    const setLsdApi3ProxyOracleReaderMaxStaleTimesSubActionParams: SetLsdApi3ProxyOracleReaderMaxStaleTimesSubActionParams = {
      lsdApi3ProxyOracleReader: registry.lsdApi3ProxyOracleReaderProxy,
      tokens: tokens,
      maxStaleTimes: maxStaleTimes,
    }
    // set tokens quote tokens params
    const setLsdApi3ProxyOracleReaderQuoteTokensSubActionParams: SetLsdApi3ProxyOracleReaderQuoteTokensSubActionParams = {
      lsdApi3ProxyOracleReader: registry.lsdApi3ProxyOracleReaderProxy,
      tokens: tokens,
      quoteTokens: quoteTokens,
    }

    // return subactions
    return [
      new SetLsdApi3ProxyOracleReaderDataFeedProxiesSubAction(governor, setLsdApi3ProxyOracleReaderDataFeedProxiesSubActionParams),
      new SetLsdApi3ProxyOracleReaderMaxStaleTimesSubAction(governor, setLsdApi3ProxyOracleReaderMaxStaleTimesSubActionParams),
      new SetLsdApi3ProxyOracleReaderQuoteTokensSubAction(governor, setLsdApi3ProxyOracleReaderQuoteTokensSubActionParams),
    ]
  }
}
