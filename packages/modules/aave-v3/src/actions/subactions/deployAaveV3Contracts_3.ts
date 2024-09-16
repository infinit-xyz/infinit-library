import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import { DeployL2PoolImplementationTxBuilder } from '@actions/subactions/tx-builders/l2Pool/deployL2Pool'

import { AaveV3Registry } from '@/src/type'

export type DeployAaveV3Contracts_3SubActionParams = {
  poolAddressesProvider: Address
  liquidationLogic: Address
  supplyLogic: Address
  eModeLogic: Address
  flashLoanLogic: Address
  borrowLogic: Address
  bridgeLogic: Address
  poolLogic: Address
}

export type DeployAaveV3Contracts_3SubActionMsg = {
  l2PoolImpl: Address
}

export class DeployAaveV3Contracts_3SubAction extends SubAction<
  DeployAaveV3Contracts_3SubActionParams,
  AaveV3Registry,
  DeployAaveV3Contracts_3SubActionMsg
> {
  constructor(client: InfinitWallet, params: DeployAaveV3Contracts_3SubActionParams) {
    super(DeployAaveV3Contracts_3SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // deploy l2 pool impl (if deploy on L2)
    const deployL2PoolImplementation = new DeployL2PoolImplementationTxBuilder(this.client, {
      provider: this.params.poolAddressesProvider,
      liquidationLogic: this.params.liquidationLogic,
      supplyLogic: this.params.supplyLogic,
      eModeLogic: this.params.eModeLogic,
      flashLoanLogic: this.params.flashLoanLogic,
      borrowLogic: this.params.borrowLogic,
      bridgeLogic: this.params.bridgeLogic,
      poolLogic: this.params.poolLogic,
    })
    this.txBuilders.push(deployL2PoolImplementation)
  }

  public async updateRegistryAndMessage(
    registry: AaveV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<AaveV3Registry, DeployAaveV3Contracts_3SubActionMsg>> {
    const [deployL2PoolImplHash] = txHashes
    const { contractAddress: l2PoolImpl } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployL2PoolImplHash })
    if (!l2PoolImpl) {
      throw new ContractNotFoundError(deployL2PoolImplHash, 'l2PoolImpl')
    }
    registry['l2PoolImpl'] = l2PoolImpl
    const newMessage = { l2PoolImpl: l2PoolImpl }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
