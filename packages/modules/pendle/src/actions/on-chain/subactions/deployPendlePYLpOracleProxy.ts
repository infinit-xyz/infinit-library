import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/on-chain/subactions/txBuilders/TransparentUpgradeableProxy/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployPendlePYLpOracleProxySubActionParams = {
  proxyAdmin: Address
  pendlePYLpOracleImpl: Address
}

export type DeployPendlePYLpOracleProxyMsg = {
  pendlePYLpOracleProxy: Address
}

export class DeployPendlePYLpOracleProxySubAction extends SubAction<
  DeployPendlePYLpOracleProxySubActionParams,
  PendleRegistry,
  DeployPendlePYLpOracleProxyMsg
> {
  constructor(client: InfinitWallet, params: DeployPendlePYLpOracleProxySubActionParams) {
    super(DeployPendlePYLpOracleProxySubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy proxy point to implementation -----------
    this.txBuilders.push(
      new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        logic: this.params.pendlePYLpOracleImpl,
        admin: this.params.proxyAdmin,
        data: '0x',
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendlePYLpOracleProxyMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [deployPendlePYLpOracleProxyHash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: pendlePYLpOracleProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendlePYLpOracleProxyHash,
    })

    // check if the contract address is not found
    if (!pendlePYLpOracleProxy) {
      throw new ContractNotFoundError(deployPendlePYLpOracleProxyHash, 'PendlePYLpOracleProxy')
    }

    // assign the contract address to the registry
    registry['pendlePYLpOracleProxy'] = pendlePYLpOracleProxy

    const newMessage: DeployPendlePYLpOracleProxyMsg = {
      pendlePYLpOracleProxy,
    }

    // return the new registry and new message
    return { newRegistry: registry, newMessage: newMessage }
  }
}
