import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { InitCapitalRegistry } from '@/src/type'
import { DeployAccessControlManagerTxBuilder } from '@actions/subactions/tx-builders/AccessControlManager/deploy'
import { DeployProxyAdminTxBuilder } from '@actions/subactions/tx-builders/ProxyAdmin/deploy'

export type DeployInitCapitalContracts_1SubActionParams = {}

export type DeployInitCapitalMsg = {
  proxyAdmin: Address
  accessControlManager: Address
}

export class DeployInitCapitalContracts1SubAction extends SubAction<DeployInitCapitalContracts_1SubActionParams, InitCapitalRegistry, DeployInitCapitalMsg> {
  constructor(client: InfinitWallet, params: DeployInitCapitalContracts_1SubActionParams) {
    super(DeployInitCapitalContracts1SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- Core -----------
    this.txBuilders.push(new DeployAccessControlManagerTxBuilder(this.client))
    // ----------- Proxy Admin -----------
    this.txBuilders.push(new DeployProxyAdminTxBuilder(this.client))
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployInitCapitalMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployAccessControlManagerHash, deployProxyAdminHash] = txHashes

    const { contractAddress: accessControlManager } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployAccessControlManagerHash,
    })
    if (!accessControlManager) {
      throw new ContractNotFoundError(deployAccessControlManagerHash, 'AccessControlManager')
    }
    registry['accessControlManager'] = accessControlManager

    const { contractAddress: proxyAdmin } = await this.client.publicClient.waitForTransactionReceipt({
       hash: deployProxyAdminHash 
    })
    if (!proxyAdmin) {
      throw new ContractNotFoundError(deployProxyAdminHash, 'ProxyAdmin')
    }
    registry['proxyAdmin'] = proxyAdmin

    const newMessage: DeployInitCapitalMsg = {
      proxyAdmin,
      accessControlManager
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
