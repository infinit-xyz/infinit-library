import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployUnsupportedProtocolTxBuilder } from '@actions/subactions/tx-builders/UnsupportedProtocol/deploy'

import { UniswapV3Registry } from '@/src/type'

export type DeployUnsupportedProtocolParams = {}

export type DeployUnsupportedProtocolMsg = {
  unsupportedProtocol: Address
}

export class DeployUnsupportedProtocolSubAction extends SubAction<
  DeployUnsupportedProtocolParams,
  UniswapV3Registry,
  DeployUnsupportedProtocolMsg
> {
  constructor(client: InfinitWallet, params: DeployUnsupportedProtocolParams) {
    super(DeployUnsupportedProtocolSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new DeployUnsupportedProtocolTxBuilder(this.client))
  }

  public async updateRegistryAndMessage(
    registry: UniswapV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<UniswapV3Registry, DeployUnsupportedProtocolMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployUnsupportedProtocolHash] = txHashes

    const { contractAddress: unsupportedProtocol } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployUnsupportedProtocolHash,
    })
    if (!unsupportedProtocol) {
      throw new ContractNotFoundError(deployUnsupportedProtocolHash, 'UnsupportedProtocol')
    }
    registry['unsupportedProtocol'] = unsupportedProtocol

    const newMessage: DeployUnsupportedProtocolMsg = {
      unsupportedProtocol,
    }

    return { newRegistry: registry, newMessage: newMessage }
  }
}
