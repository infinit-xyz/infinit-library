import { Address, Hash, Hex, zeroAddress, zeroHash } from 'viem'

import { TxBuilder } from '@infinit-xyz/core'
import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import {
  SetDataFeedProxiesTxBuilder as Api3SetDataFeedProxiesTxBuilder,
  SetDataFeedProxiesTxBuilderParams as Api3SetDataFeedProxiesTxBuilderParams,
} from '@actions/subactions/tx-builders/Api3ProxyOracleReader/setDataFeedProxies'
import {
  SetMaxStaleTimesTxBuilder as Api3SetMaxStaleTimesTxBuilder,
  SetMaxStaleTimesTxBuilderParams as Api3SetMaxStaleTimesTxBuilderParams,
} from '@actions/subactions/tx-builders/Api3ProxyOracleReader/setMaxStaleTimes'
import {
  SetDataFeedProxiesTxBuilder as LsdApi3SetDataFeedProxiesTxBuilder,
  SetDataFeedProxiesTxBuilderParams as LsdApi3SetDataFeedProxiesTxBuilderParams,
} from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/setDataFeedProxies'
import {
  SetMaxStaleTimesTxBuilder as LsdApi3SetMaxStaleTimesTxBuilder,
  SetMaxStaleTimesTxBuilderParams as LsdApi3SetMaxStaleTimesTxBuilderParams,
} from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/setMaxStaleTimes'
import {
  SetQuoteTokensTxBuilder as LsdApi3SetQuoteTokensTxBuilder,
  SetQuoteTokensTxBuilderParams as LsdApi3SetQuoteTokensTxBuilderParams,
} from '@actions/subactions/tx-builders/LsdApi3ProxyOracleReader/setQuoteTokens'
import {
  SetMaxStaleTimesTxBuilder as PythSetMaxStaleTimesTxBuilder,
  SetMaxStaleTimesTxBuilderParams as PythSetMaxStaleTimesTxBuilderParams,
} from '@actions/subactions/tx-builders/PythOracleReader/setMaxStaleTimes'
import {
  SetPriceIdsTxBuilder as PythSetPriceIdsTxBuilder,
  SetPriceIdsTxBuilderParams as PythSetPriceIdsTxBuilderParams,
} from '@actions/subactions/tx-builders/PythOracleReader/setPriceIds'

import { InitCapitalRegistry } from '@/src/type'
import { readArtifact } from '@utils/artifact'

export type PythParams = {
  priceFeed: Hex
  maxStaleTime: bigint
}

export type Api3Params = {
  dataFeedProxy: Address
  maxStaleTime: bigint
}

export type LsdApi3Params = {
  dataFeedProxy: Address
  maxStaleTime: bigint
  quoteToken: {
    token: Address
    params?: {
      oracleReader: Address
      dataFeedProxy: Address
      maxStaleTime: bigint
    }
  }
}

export type SourceConfig = {
  type: 'api3' | 'lsdApi3' | 'pyth'
  token: Address
  oracleReader: Address
  params: Api3Params | LsdApi3Params | PythParams
}

export type SetNewPoolOracleReaderSubActionParams = {
  primarySource: SourceConfig | undefined
  secondarySource: SourceConfig | undefined
}

export class SetNewPoolOracleReaderSubAction extends SubAction<SetNewPoolOracleReaderSubActionParams, InitCapitalRegistry, object> {
  constructor(client: InfinitWallet, params: SetNewPoolOracleReaderSubActionParams) {
    super(SetNewPoolOracleReaderSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    const primarySource = this.params.primarySource
    const secondarySource = this.params.secondarySource
    if (primarySource) {
      const txBuilder = this.handleTxBuilders(primarySource)
      this.txBuilders.push(...txBuilder)
    }
    if (secondarySource) {
      const txBuilder = this.handleTxBuilders(secondarySource)
      this.txBuilders.push(...txBuilder)
    }
  }

  protected override async internalValidate(registry: InitCapitalRegistry): Promise<void> {
    const primarySource = this.params.primarySource
    const secondarySource = this.params.secondarySource
    if (primarySource) {
      await this.handleInternalValidates(primarySource, registry)
    }
    if (secondarySource) {
      await this.handleInternalValidates(secondarySource, registry)
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
  private async handleInternalValidates(oracle: SourceConfig, registry: InitCapitalRegistry) {
    switch (oracle.type) {
      case 'api3': {
        const api3ProxyOracleReaderArtifact = await readArtifact('Api3ProxyOracleReader')
        const [dataFeedProxy, maxStaleTime] = await this.client.publicClient.readContract({
          address: oracle.oracleReader,
          abi: api3ProxyOracleReaderArtifact.abi,
          functionName: 'dataFeedInfos',
          args: [oracle.token],
        })
        if (maxStaleTime !== 0n || dataFeedProxy !== zeroAddress) {
          throw new ContractValidateError('Api3ProxyOracleReader Token parameters has been already set')
        }
        break
      }
      case 'pyth': {
        const pythOracleReaderArtifact = await readArtifact('PythOracleReader')
        const priceId = await this.client.publicClient.readContract({
          address: oracle.oracleReader,
          abi: pythOracleReaderArtifact.abi,
          functionName: 'priceIds',
          args: [oracle.token],
        })
        const maxStaleTime = await this.client.publicClient.readContract({
          address: oracle.oracleReader,
          abi: pythOracleReaderArtifact.abi,
          functionName: 'maxStaleTimes',
          args: [oracle.token],
        })
        if (maxStaleTime !== 0n || priceId !== zeroHash) {
          throw new ContractValidateError('PythOracleReader Token parameters has been already set')
        }
        break
      }
      case 'lsdApi3': {
        const params = oracle.params as LsdApi3Params
        // check lsd api3
        const lsdApi3ProxyOracleReaderArtifact = await readArtifact('LsdApi3ProxyOracleReader')
        const [dataFeedProxy, quoteToken, maxStaleTime] = await this.client.publicClient.readContract({
          address: oracle.oracleReader,
          abi: lsdApi3ProxyOracleReaderArtifact.abi,
          functionName: 'dataFeedInfos',
          args: [oracle.token],
        })
        if (maxStaleTime !== 0n || dataFeedProxy !== zeroAddress || quoteToken !== zeroAddress) {
          throw new ContractValidateError('LsdApi3ProxyOracleReader Token parameters has been already set')
        }
        // check if not params for the quote token, quote token oracle shoud be already set
        if (!params.quoteToken.params) {
          if (!registry.api3ProxyOracleReaderProxy) throw new ValidateInputValueError('registry: api3ProxyOracleReader not found')
          const api3ProxyOracleReaderArtifact = await readArtifact('Api3ProxyOracleReader')
          const [dataFeedProxy, maxStaleTime] = await this.client.publicClient.readContract({
            address: registry.api3ProxyOracleReaderProxy,
            abi: api3ProxyOracleReaderArtifact.abi,
            functionName: 'dataFeedInfos',
            args: [params.quoteToken.token],
          })
          // check if token parameters has been set
          if (maxStaleTime === 0n && dataFeedProxy === zeroAddress)
            throw new ContractValidateError('Api3ProxyOracleReader Token parameters has not been set')
        }
        break
      }
    }
  }

  private handleTxBuilders(oracle: SourceConfig): TxBuilder[] {
    const txBuilders: TxBuilder[] = []
    switch (oracle.type) {
      case 'api3': {
        const params = oracle.params as Api3Params
        // 1. set datafeed proxies
        const dataFeedProxiesTxBuilderParams: Api3SetDataFeedProxiesTxBuilderParams = {
          api3ProxyOracleReader: oracle.oracleReader,
          tokens: [oracle.token],
          dataFeedProxies: [params.dataFeedProxy],
        }
        txBuilders.push(new Api3SetDataFeedProxiesTxBuilder(this.client, dataFeedProxiesTxBuilderParams))
        // 2. set max staletimes
        const maxStaleTimesTxBuilderParams: Api3SetMaxStaleTimesTxBuilderParams = {
          api3ProxyOracleReader: oracle.oracleReader,
          tokens: [oracle.token],
          maxStaleTimes: [oracle.params.maxStaleTime],
        }
        txBuilders.push(new Api3SetMaxStaleTimesTxBuilder(this.client, maxStaleTimesTxBuilderParams))
        break
      }
      case 'pyth': {
        const params = oracle.params as PythParams
        // 1. set max staletimes
        const priceIdsTxBuilderParams: PythSetPriceIdsTxBuilderParams = {
          pythOracleReader: oracle.oracleReader,
          tokens: [oracle.token],
          priceIds: [params.priceFeed],
        }
        this.txBuilders.push(new PythSetPriceIdsTxBuilder(this.client, priceIdsTxBuilderParams))
        // 2. set max staletimes
        const maxStaleTimesTxBuilderParams: PythSetMaxStaleTimesTxBuilderParams = {
          pythOracleReader: oracle.oracleReader,
          tokens: [oracle.token],
          maxStaleTimes: [oracle.params.maxStaleTime],
        }
        this.txBuilders.push(new PythSetMaxStaleTimesTxBuilder(this.client, maxStaleTimesTxBuilderParams))
        break
      }
      case 'lsdApi3': {
        const params = oracle.params as LsdApi3Params
        // 1. set api3OracleReader first, if quote token params is set
        if (params.quoteToken.params) {
          // 1.1 set datafeed proxies
          const dataFeedProxiesTxBuilderParams: Api3SetDataFeedProxiesTxBuilderParams = {
            api3ProxyOracleReader: params.quoteToken.params.oracleReader,
            tokens: [params.quoteToken.token],
            dataFeedProxies: [params.quoteToken.params.dataFeedProxy],
          }
          txBuilders.push(new Api3SetDataFeedProxiesTxBuilder(this.client, dataFeedProxiesTxBuilderParams))
          // 1.2 set max staletimes
          const maxStaleTimesTxBuilderParams: Api3SetMaxStaleTimesTxBuilderParams = {
            api3ProxyOracleReader: params.quoteToken.params.oracleReader,
            tokens: [params.quoteToken.token],
            maxStaleTimes: [params.quoteToken.params.maxStaleTime],
          }
          txBuilders.push(new Api3SetMaxStaleTimesTxBuilder(this.client, maxStaleTimesTxBuilderParams))
        }
        // 2. set lsdApi3ProxyOracleReader
        // 2.1 set datafeed proxies
        const dataFeedProxiesTxBuilderParams: LsdApi3SetDataFeedProxiesTxBuilderParams = {
          lsdApi3ProxyOracleReader: oracle.oracleReader,
          tokens: [oracle.token],
          dataFeedProxies: [params.dataFeedProxy],
        }
        txBuilders.push(new LsdApi3SetDataFeedProxiesTxBuilder(this.client, dataFeedProxiesTxBuilderParams))
        // 2.2 set max staletimes
        const maxStaleTimesTxBuilderParams: LsdApi3SetMaxStaleTimesTxBuilderParams = {
          lsdApi3ProxyOracleReader: oracle.oracleReader,
          tokens: [oracle.token],
          maxStaleTimes: [oracle.params.maxStaleTime],
        }
        txBuilders.push(new LsdApi3SetMaxStaleTimesTxBuilder(this.client, maxStaleTimesTxBuilderParams))
        // 2.3 set quote token
        const setQuoteTokensTxBuilderParams: LsdApi3SetQuoteTokensTxBuilderParams = {
          lsdApi3ProxyOracleReader: oracle.oracleReader,
          tokens: [oracle.token],
          quoteTokens: [params.quoteToken.token],
        }
        txBuilders.push(new LsdApi3SetQuoteTokensTxBuilder(this.client, setQuoteTokensTxBuilderParams))
        break
      }
    }

    return txBuilders
  }
}
