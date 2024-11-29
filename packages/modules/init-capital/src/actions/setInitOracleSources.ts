import { z } from 'zod'

import { Address } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress, zodAddressNonZero } from '@infinit-xyz/core/internal'
import { zodHex } from '@infinit-xyz/core/internal'

import {
  Api3Params,
  LsdApi3Params,
  PythParams,
  SetNewPoolOracleReaderSubAction,
  SetNewPoolOracleReaderSubActionParams,
  SourceConfig,
} from '@actions/subactions/setNewPoolOracleReader'

import { InitCapitalRegistry } from '@/src/type'

export const oracleReader = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('api3'),
    params: z.object({
      dataFeedProxy: zodAddressNonZero.describe(
        `Address of data feed proxy e.g. '0x123...abc', access https://market.api3.org to find the DataFeedProxy`,
      ),
      maxStaleTime: z.bigint().nonnegative(`Max stale time in seconds e.g. 86400n for 1 day`),
    }) satisfies z.ZodType<Api3Params>,
  }),
  z.object({
    type: z.literal('pyth'),
    params: z.object({
      priceFeed: zodHex.describe(`Pyth's priceId to use for fetching price check https://www.pyth.network/developers/price-feed-ids`),
      maxStaleTime: z.bigint().nonnegative(`Max stale time in seconds e.g. 86400n for 1 day`),
    }) satisfies z.ZodType<PythParams>,
  }),
  // TODO find the way to enforce LsdApi3Params type here with the omit of oracleReader field
  z.object({
    type: z.literal('lsdApi3'),
    params: z.object({
      dataFeedProxy: zodAddressNonZero,
      maxStaleTime: z.bigint().nonnegative(),
      quoteToken: z.object({
        token: zodAddress,
        params: z
          .object({
            dataFeedProxy: zodAddressNonZero.describe(
              `Address of data feed proxy e.g. '0x123...abc', access https://market.api3.org to find the DataFeedProxy`,
            ),
            maxStaleTime: z.bigint().nonnegative(`Max stale time in seconds e.g. 86400n for 1 day`),
          })
          .optional(),
      }),
    }),
  }),
])

export type OracleReader = z.infer<typeof oracleReader>

export const oracleReaderRegistryName: Record<'api3' | 'lsdApi3' | 'pyth', keyof InitCapitalRegistry> = {
  api3: 'api3ProxyOracleReaderProxy',
  lsdApi3: 'lsdApi3ProxyOracleReaderProxy',
  pyth: 'pythOracleReaderProxy',
}

export const SetInitOracleSourcesActionParamsSchema = z.object({
  token: zodAddressNonZero.describe(`Address of the token e.g. '0x123...abc'`),
  oracleConfig: z
    .object({
      primarySource: oracleReader.describe(`Primary source oracle reader config`),
      secondarySource: oracleReader.optional().describe(`Secondary source oracle reader config, need to set maxPrivceDeviationE18 if set`),
      maxPriceDeviationE18: z
        .bigint()
        .optional()
        .describe(`Max price deviation between primary and secondary sources in E18, need to set secondarySource if set`),
    })
    .optional()
    .describe('Set oracle sources for the token, not required if the token source is already set'),
})

export type SetInitOracleSourcesActionParams = z.infer<typeof SetInitOracleSourcesActionParamsSchema>

export type SetInitOracleSourcesActionData = {
  params: SetInitOracleSourcesActionParams
  signer: Record<'governor', InfinitWallet>
}

export class SetInitOracleSourcesAction extends Action<SetInitOracleSourcesActionData, InitCapitalRegistry> {
  constructor(data: SetInitOracleSourcesActionData) {
    validateActionData(data, SetInitOracleSourcesActionParamsSchema, ['governor'])
    super(SetInitOracleSourcesAction.name, data)
  }

  protected getSubActions(registry: InitCapitalRegistry): SubAction[] {
    const governor = this.data.signer['governor']

    const setNewPoolOracleReaderSubActionParams: SetNewPoolOracleReaderSubActionParams = {
      primarySource: undefined,
      secondarySource: undefined,
    }
    const oracleConfig = this.data.params.oracleConfig

    // validate registry
    if (!registry.initOracleProxy) throw new ValidateInputValueError('registry: initOracleProxy not found')

    // set primary source
    if (oracleConfig && oracleConfig.primarySource) {
      setNewPoolOracleReaderSubActionParams.primarySource = configureOracleSourceConfig(
        this.data.params.token,
        oracleConfig.primarySource,
        registry,
      )
    }
    // set secondary source
    if (oracleConfig && oracleConfig.secondarySource) {
      setNewPoolOracleReaderSubActionParams.secondarySource = configureOracleSourceConfig(
        this.data.params.token,
        oracleConfig.secondarySource,
        registry,
      )
    }
    return [new SetNewPoolOracleReaderSubAction(governor, setNewPoolOracleReaderSubActionParams)]
  }
}

const configureOracleSourceConfig = (token: Address, oracleReader: OracleReader, registry: InitCapitalRegistry): SourceConfig => {
  const sourceRegistryName = oracleReaderRegistryName[oracleReader.type]
  if (!registry[sourceRegistryName]) throw new ValidateInputValueError(`registry: ${sourceRegistryName} not found`)
  const sourceAddress = registry[sourceRegistryName] as Address

  const sourceConfig: SourceConfig = {
    type: oracleReader.type,
    token: token,
    oracleReader: sourceAddress,
    params: oracleReader.params,
  }

  // read api3 oracle reader address from the registry for lsdApi3
  if (oracleReader.type === 'lsdApi3' && oracleReader.params.quoteToken.params) {
    const api3ProxyOracleReaderRegistryName = oracleReaderRegistryName['api3']
    if (!registry[api3ProxyOracleReaderRegistryName])
      throw new ValidateInputValueError(`registry: ${api3ProxyOracleReaderRegistryName} not found`)
    const api3ProxyOracleReader = registry[api3ProxyOracleReaderRegistryName] as Address
    const params = oracleReader.params
    const lsdApi3Params: LsdApi3Params = {
      dataFeedProxy: params.dataFeedProxy,
      maxStaleTime: params.maxStaleTime,
      quoteToken: {
        token: params.quoteToken.token,
        params: {
          dataFeedProxy: params.quoteToken.params!.dataFeedProxy,
          maxStaleTime: params.quoteToken.params!.maxStaleTime,
          oracleReader: api3ProxyOracleReader,
        },
      },
    }
    sourceConfig.params = lsdApi3Params
  }
  return sourceConfig
}
