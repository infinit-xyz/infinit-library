import { Address, Hash, decodeEventLog } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { EventNotFoundError } from '@infinit-xyz/core/errors'

import {
  DeployYTV3CreationCodeTxBuilder,
  DeployYTV3CreationCodeTxBuilderParams,
} from '@actions/subactions/tx-builders/BaseSplitCodeFactoryContract/deployYTV3CreationCode'

import { PendleV3Registry } from '@/src/type'
import { readArtifact } from '@utils/artifact'

export type DeployYTV3CreationCodeSubactionParams = DeployYTV3CreationCodeTxBuilderParams

export type DeployYTV3CreationCodeSubactionMsg = {
  ytV3CreationCodeContractA: Address
  ytV3CreationCodeContractSizeA: bigint
  ytCreationCodeContractB: Address
  ytCreationCodeSizeB: bigint
}
export class DeployYTV3CreationCodeSubaction extends SubAction<
  DeployYTV3CreationCodeSubactionParams,
  PendleV3Registry,
  DeployYTV3CreationCodeSubactionMsg
> {
  constructor(client: InfinitWallet, params: DeployYTV3CreationCodeTxBuilderParams) {
    super(DeployYTV3CreationCodeSubaction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployYTV3CreationCodeTxBuilder(this.client, this.params)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployYTV3CreationCodeSubactionMsg>> {
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
      throw new EventNotFoundError(eventLog.eventName, 'Deployed')
    }
    console.log(eventLog.args.creationCodeContractA)
    return {
      newRegistry: registry,
      newMessage: {
        ytV3CreationCodeContractA: eventLog.args.creationCodeContractA,
        ytV3CreationCodeContractSizeA: eventLog.args.creationCodeSizeA,
        ytCreationCodeContractB: eventLog.args.creationCodeContractB,
        ytCreationCodeSizeB: eventLog.args.creationCodeSizeB,
      },
    }
  }
}
