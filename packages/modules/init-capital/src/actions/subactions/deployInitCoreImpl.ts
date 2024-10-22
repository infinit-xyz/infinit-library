import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { InitCapitalRegistry } from '@/src/type'
import { DeployInitCoreTxBuilder } from '@actions/subactions/tx-builders/InitCore/deploy'

export type DeployInitCoreImplSubActionParams = {
  posManagerProxy: Address
  accessControlManager: Address
}

export type DeployInitCoreImplMsg = {
  initCoreImpl: Address
}

export class DeployInitCoreImplSubAction extends SubAction<DeployInitCoreImplSubActionParams, InitCapitalRegistry, DeployInitCoreImplMsg> {
  constructor(client: InfinitWallet, params: DeployInitCoreImplSubActionParams) {
    super(DeployInitCoreImplSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- implementation -----------
    this.txBuilders.push(new DeployInitCoreTxBuilder(this.client, {
      posManager: this.params.posManagerProxy,
      accessControlManager: this.params.accessControlManager
    }))
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployInitCoreImplMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployInitCoreImplHash] = txHashes

    const { contractAddress: initCoreImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployInitCoreImplHash,
    })
    if (!initCoreImpl) {
      throw new ContractNotFoundError(deployInitCoreImplHash, 'InitCore')
    }
    registry['initCoreImpl'] = initCoreImpl

    const newMessage: DeployInitCoreImplMsg = {
      initCoreImpl
    }

    return { newRegistry: registry, newMessage: newMessage }
  }
}
