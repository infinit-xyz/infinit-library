import { Address, Hash, decodeEventLog } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { InvalidEventError } from '@infinit-xyz/core/errors'

import {
  DeployPendleMarketV3CreationCodeTxBuilder,
  DeployPendleMarketV3CreationCodeTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/BaseSplitCodeFactoryContract/deployPendleMarketV3CreationCode'

import { PendleRegistry } from '@/src/type'
import { readArtifact } from '@utils/artifact'

export type DeployPendleMarketV3CreationCodeSubactionParams = DeployPendleMarketV3CreationCodeTxBuilderParams

export type DeployPendleMarketV3CreationCodeSubactionMsg = {
  pendleMarketV3CreationCodeContractA: Address
  pendleMarketV3CreationCodeSizeA: bigint
  pendleMarketV3CreationCodeContractB: Address
  pendleMarketV3CreationCodeSizeB: bigint
}

export class DeployPendleMarketV3CreationCodeSubaction extends SubAction<
  DeployPendleMarketV3CreationCodeSubactionParams,
  PendleRegistry,
  {}
> {
  constructor(client: InfinitWallet, params: DeployPendleMarketV3CreationCodeTxBuilderParams) {
    super(DeployPendleMarketV3CreationCodeSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployPendleMarketV3CreationCodeTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, {}>> {
    const [deployYTV3CreationCodeTxHash] = txHashes

    const [baseSplitCodeFactoryContractArtifact, txReceipt] = await Promise.all([
      readArtifact('BaseSplitCodeFactoryContract'),
      this.client.publicClient.waitForTransactionReceipt({
        hash: deployYTV3CreationCodeTxHash,
      }),
    ])

    const eventLog = decodeEventLog({
      abi: baseSplitCodeFactoryContractArtifact.abi,
      data: txReceipt.logs[0].data,
      topics: txReceipt.logs[0].topics,
    })
    if (eventLog.eventName !== 'Deployed') {
      throw new InvalidEventError(eventLog.eventName, 'Deployed')
    }

    return {
      newRegistry: registry,
      newMessage: {
        pendleMarketV3CreationCodeContractA: eventLog.args.creationCodeContractA,
        pendleMarketV3CreationCodeSizeA: eventLog.args.creationCodeSizeA,
        pendleMarketV3CreationCodeContractB: eventLog.args.creationCodeContractB,
        pendleMarketV3CreationCodeSizeB: eventLog.args.creationCodeSizeB,
      },
    }
  }
}
