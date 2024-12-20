import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import { DeployOracleLibTxBuilder } from '@actions/subactions/tx-builders/OracleLib/deploy'

import { PendleV3Registry } from '@/src/type'

export type DeployOracleLibSubactionMsg = {
  oracleLib: Address
}

export class DeployOracleLibSubaction extends SubAction<object, PendleV3Registry, DeployOracleLibSubactionMsg> {
  constructor(client: InfinitWallet) {
    super(DeployOracleLibSubaction.name, client, {})
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployOracleLibTxBuilder(this.client)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleV3Registry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleV3Registry, DeployOracleLibSubactionMsg>> {
    const [deployOracleLibTxHash] = txHashes
    const { contractAddress: oracleLib } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployOracleLibTxHash,
    })
    if (!oracleLib) {
      throw new ContractNotFoundError(deployOracleLibTxHash, 'OracleLib')
    }
    registry.oracleLib = oracleLib

    const newMessage = {
      oracleLib: oracleLib,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
