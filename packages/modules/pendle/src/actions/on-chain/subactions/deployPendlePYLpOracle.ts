import { Address, Hash } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import { DeployPendlePYLpOracleTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendlePYLpOracle/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployPendlePYLpOracleMsg = {
  pendlePYLpOracle: Address
}
export class DeployPendlePYLpOracleSubaction extends SubAction<object, PendleRegistry, DeployPendlePYLpOracleMsg> {
  constructor(client: InfinitWallet) {
    super(DeployPendlePYLpOracleSubaction.name, client, {})
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new DeployPendlePYLpOracleTxBuilder(this.client)]
  }

  protected async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hash[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendlePYLpOracleMsg>> {
    const [deployPendleMarketFactoryV3TxHash] = txHashes
    const { contractAddress: pendlePYLpOracle } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleMarketFactoryV3TxHash,
    })
    if (!pendlePYLpOracle) {
      throw new ContractNotFoundError(deployPendleMarketFactoryV3TxHash, 'PendleMarketFactoryV3')
    }
    registry.pendlePYLpOracle = pendlePYLpOracle

    const newMessage = {
      pendlePYLpOracle: pendlePYLpOracle,
    }

    return {
      newRegistry: registry,
      newMessage: newMessage,
    }
  }
}
