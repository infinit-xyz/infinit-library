import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployMoneyMarketHookProxyTxBuilder } from '@actions/subactions/tx-builders/MoneyMarketHook/deployProxy'
import { DeployRiskManagerProxyTxBuilder } from '@actions/subactions/tx-builders/RiskManager/deployProxy'

import { InitCapitalRegistry } from '@/src/type'

export type DeployInitCapitalContracts_5SubActionParams = {
  proxyAdmin: Address
  initCoreProxy: Address
  wrappedNativeToken: Address
  riskManagerImpl: Address
  moneyMarketHookImpl: Address
}

export type DeployInitCapitalMsg_5 = {
  riskManagerProxy: Address
  moneyMarketHookProxy: Address
}

export class DeployInitCapitalContracts5SubAction extends SubAction<
  DeployInitCapitalContracts_5SubActionParams,
  InitCapitalRegistry,
  DeployInitCapitalMsg_5
> {
  constructor(client: InfinitWallet, params: DeployInitCapitalContracts_5SubActionParams) {
    super(DeployInitCapitalContracts5SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- proxy -----------
    this.txBuilders.push(
      new DeployRiskManagerProxyTxBuilder(this.client, {
        logic: this.params.riskManagerImpl,
        admin: this.params.proxyAdmin,
      }),
    )
    this.txBuilders.push(
      new DeployMoneyMarketHookProxyTxBuilder(this.client, {
        logic: this.params.moneyMarketHookImpl,
        admin: this.params.proxyAdmin,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployInitCapitalMsg_5>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [deployRiskManagerProxyHash, deployMoneyMarketHookProxyHash] = txHashes

    const { contractAddress: riskManagerProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployRiskManagerProxyHash,
    })
    if (!riskManagerProxy) {
      throw new ContractNotFoundError(deployRiskManagerProxyHash, 'RiskManagerProxy')
    }
    registry['riskManagerProxy'] = riskManagerProxy

    const { contractAddress: moneyMarketHookProxy } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployMoneyMarketHookProxyHash,
    })
    if (!moneyMarketHookProxy) {
      throw new ContractNotFoundError(deployMoneyMarketHookProxyHash, 'MoneyMarketHookProxy')
    }
    registry['moneyMarketHookProxy'] = moneyMarketHookProxy

    const newMessage: DeployInitCapitalMsg_5 = {
      riskManagerProxy,
      moneyMarketHookProxy,
    }

    return { newRegistry: registry, newMessage: newMessage }
  }
}
