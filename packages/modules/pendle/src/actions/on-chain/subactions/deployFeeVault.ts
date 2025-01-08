import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployFeeVaultTxBuilder, DeployFeeVaultTxBuilderParams } from '@actions/on-chain/subactions/txBuilders/FeeVault/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployFeeVaultSubActionParams = DeployFeeVaultTxBuilderParams

export type DeployFeeVaultMsg = {
  feeVault: Address
}

export class DeployFeeVaultSubAction extends SubAction<DeployFeeVaultSubActionParams, PendleRegistry, DeployFeeVaultMsg> {
  constructor(client: InfinitWallet, params: DeployFeeVaultSubActionParams) {
    super(DeployFeeVaultSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- deploy FeeVault -----------
    this.txBuilders.push(new DeployFeeVaultTxBuilder(this.client, this.params))
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployFeeVaultMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    // destruct the tx hashes
    const [deployFeeVaultHash] = txHashes

    // get the deployed address from the txHash
    const { contractAddress: feeVault } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployFeeVaultHash,
    })

    // check if the contract address is not found
    if (!feeVault) {
      throw new ContractNotFoundError(deployFeeVaultHash, 'FeeVault')
    }

    // assign the contract address to the registry
    registry['feeVault'] = feeVault

    // construct the new message
    const newMessage: DeployFeeVaultMsg = {
      feeVault,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
