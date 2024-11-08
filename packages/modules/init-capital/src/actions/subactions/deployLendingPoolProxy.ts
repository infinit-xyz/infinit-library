import _ from 'lodash'

import { Address, Hex, getAddress } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/subactions/tx-builders/TransparentUpgradeableProxy/deploy'

import { InitCapitalRegistry } from '@/src/type'

export type DeployLendingPoolProxySubActionParams = {
  name: string
  proxyAdmin: Address
  lendingPoolImpl: Address
}

export type DeployLendingPoolSubActionMsg = {
  lendingPoolProxy: Address
}

export class DeployLendingPoolProxySubAction extends SubAction<
  DeployLendingPoolProxySubActionParams,
  InitCapitalRegistry,
  DeployLendingPoolSubActionMsg
> {
  constructor(client: InfinitWallet, params: DeployLendingPoolProxySubActionParams) {
    super(DeployLendingPoolProxySubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy proxy -----------
    this.txBuilders.push(
      new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        logic: this.params.lendingPoolImpl,
        admin: this.params.proxyAdmin,
        data: '0x',
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployLendingPoolSubActionMsg>> {
    // the txHashes should have at least one txHash
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }
    // extract  txHash from the txHashes
    const [deployLendingPoolProxyHash] = txHashes
    // get the lending pool proxy address from the txHash
    const { contractAddress: lendingPoolProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployLendingPoolProxyHash,
    })
    // check if the lending pool proxy is deployed
    if (!lendingPoolProxy) {
      throw new ContractNotFoundError(deployLendingPoolProxyHash, 'LendingPoolProxy')
    }

    // add new lending pool to the registry
    _.set(registry, ['lendingPools', this.params.name, 'lendingPool'], lendingPoolProxy)
    // add deployed lending pool to the message
    const newMessage: DeployLendingPoolSubActionMsg = {
      lendingPoolProxy,
    }

    return { newRegistry: registry, newMessage: newMessage }
  }
}
