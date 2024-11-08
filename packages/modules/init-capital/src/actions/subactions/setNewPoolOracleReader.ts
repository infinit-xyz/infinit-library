import { Address, Hash, Hex, zeroAddress } from 'viem'

import { TxBuilder } from '@infinit-xyz/core'
import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import {
  SetDataFeedProxiesTxBuilder as Api3SetDataFeedProxiesTxBuilder,
  SetDataFeedProxiesTxBuilderParams as Api3SetDataFeedProxiesTxBuilderParams,
} from '@actions/subactions/tx-builders/Api3ProxyOracleReader/setDataFeedProxies'
import {
  SetMaxStaleTimesTxBuilder as Api3SetMaxStaleTimesTxBuilder,
  SetMaxStaleTimesTxBuilderParams as Api3SetMaxStaleTimesTxBuilderParams,
} from '@actions/subactions/tx-builders/Api3ProxyOracleReader/setMaxStaleTimes'
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
  setQuoteToken: Address
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

  protected override async internalValidate(_registry?: InitCapitalRegistry): Promise<void> {
    const primarySource = this.params.primarySource
    const secondarySource = this.params.secondarySource
    if (primarySource) {
      await this.handleInternalValidates(primarySource)
    }
    if (secondarySource) {
      await this.handleInternalValidates(secondarySource)
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
  private async handleInternalValidates(oracle: SourceConfig) {
    if (oracle.type === 'api3') {
      const api3ProxyOracleReaderArtifact = await readArtifact('Api3ProxyOracleReader')
      const [dataFeedProxy, maxStaleTime] = await this.client.publicClient.readContract({
        address: oracle.oracleReader,
        abi: api3ProxyOracleReaderArtifact.abi,
        functionName: 'dataFeedInfos',
        args: [oracle.token],
      })
      if (maxStaleTime !== 0n && dataFeedProxy !== zeroAddress) {
        throw new ContractValidateError('Api3ProxyOracleReader Token parameters has been already set')
      }
    }
    //TODO: handle oracle has already been set
    if (oracle.type === 'lsdApi3') {
    }
    //TODO: handle oracle has already been set
    if (oracle.type === 'pyth') {
    }
  }
  private handleTxBuilders(oracle: SourceConfig): TxBuilder[] {
    const txBuilders: TxBuilder[] = []
    if (oracle.type === 'api3') {
      const params = oracle.params as Api3Params
      const dataFeedProxiesTxBuilderParams: Api3SetDataFeedProxiesTxBuilderParams = {
        api3ProxyOracleReader: oracle.oracleReader,
        tokens: [oracle.token],
        dataFeedProxies: [params.dataFeedProxy],
      }
      txBuilders.push(new Api3SetDataFeedProxiesTxBuilder(this.client, dataFeedProxiesTxBuilderParams))
      const maxStaleTimesTxBuilderParams: Api3SetMaxStaleTimesTxBuilderParams = {
        api3ProxyOracleReader: oracle.oracleReader,
        tokens: [oracle.token],
        maxStaleTimes: [oracle.params.maxStaleTime],
      }
      txBuilders.push(new Api3SetMaxStaleTimesTxBuilder(this.client, maxStaleTimesTxBuilderParams))
    }

    if (oracle.type === 'pyth') {
      const params = oracle.params as PythParams
      const priceIdsTxBuilderParams: PythSetPriceIdsTxBuilderParams = {
        pythOracleReader: oracle.oracleReader,
        tokens: [oracle.token],
        priceIds: [params.priceFeed],
      }
      this.txBuilders.push(new PythSetPriceIdsTxBuilder(this.client, priceIdsTxBuilderParams))
      const maxStaleTimesTxBuilderParams: PythSetMaxStaleTimesTxBuilderParams = {
        pythOracleReader: oracle.oracleReader,
        tokens: [oracle.token],
        maxStaleTimes: [oracle.params.maxStaleTime],
      }
      this.txBuilders.push(new PythSetMaxStaleTimesTxBuilder(this.client, maxStaleTimesTxBuilderParams))
    }
    if (oracle.type === 'lsdApi3') {
      //TODO: handle oracle
    }
    return txBuilders
  }
}
