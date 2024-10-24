import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/subactions/tx-builders/TransparentUpgradeableProxy/deploy'

import { InitCapitalRegistry } from '@/src/type'

export type DeployInitCoreProxySubActionParams = {
  proxyAdmin: Address
  initCoreImpl: Address
}

export type DeployInitCoreProxyMsg = {
  initCoreProxy: Address
}

export class DeployInitCoreProxySubAction extends SubAction<
  DeployInitCoreProxySubActionParams,
  InitCapitalRegistry,
  DeployInitCoreProxyMsg
> {
  constructor(client: InfinitWallet, params: DeployInitCoreProxySubActionParams) {
    super(DeployInitCoreProxySubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- implementation -----------
    this.txBuilders.push(
      new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        logic: this.params.initCoreImpl,
        admin: this.params.proxyAdmin,
        data: '0x',
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployInitCoreProxyMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployInitCoreProxyHash] = txHashes

    const { contractAddress: initCoreProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployInitCoreProxyHash,
    })
    if (!initCoreProxy) {
      throw new ContractNotFoundError(deployInitCoreProxyHash, 'InitCore')
    }
    registry['initCoreProxy'] = initCoreProxy

    const newMessage: DeployInitCoreProxyMsg = {
      initCoreProxy,
    }

    return { newRegistry: registry, newMessage: newMessage }
  }
}
