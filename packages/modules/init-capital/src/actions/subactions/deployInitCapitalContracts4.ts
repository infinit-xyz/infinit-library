import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployLendingPoolTxBuilder } from '@actions/subactions/tx-builders/LendingPool/deploy'
import { DeployMoneyMarketHookTxBuilder } from '@actions/subactions/tx-builders/MoneyMarketHook/deploy'
import { DeployRiskManagerTxBuilder } from '@actions/subactions/tx-builders/RiskManager/deploy'

import { DeployFeeVaultTxBuilder } from './tx-builders/FeeVault/deploy'
import { InitCapitalRegistry } from '@/src/type'

export type DeployInitCapitalContracts_4SubActionParams = {
  accessControlManager: Address
  initCoreProxy: Address
  wrappedNativeToken: Address
  feeAdmin: Address
  treasury: Address
}

export type DeployInitCapitalMsg_4 = {
  riskManagerImpl: Address
  lendingPoolImpl: Address
  moneyMarketHookImpl: Address
}

export class DeployInitCapitalContracts4SubAction extends SubAction<
  DeployInitCapitalContracts_4SubActionParams,
  InitCapitalRegistry,
  DeployInitCapitalMsg_4
> {
  constructor(client: InfinitWallet, params: DeployInitCapitalContracts_4SubActionParams) {
    super(DeployInitCapitalContracts4SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- Fee Vault -----------
    this.txBuilders.push(
      new DeployFeeVaultTxBuilder(this.client, {
        wrappedNativeToken: this.params.wrappedNativeToken,
        admin: this.params.feeAdmin,
        treasury: this.params.treasury,
      }),
    )
    // ----------- implementation -----------
    this.txBuilders.push(
      new DeployRiskManagerTxBuilder(this.client, {
        initCore: this.params.initCoreProxy,
        accessControlManager: this.params.accessControlManager,
      }),
    )
    this.txBuilders.push(
      new DeployLendingPoolTxBuilder(this.client, {
        initCore: this.params.initCoreProxy,
        accessControlManager: this.params.accessControlManager,
      }),
    )
    this.txBuilders.push(
      new DeployMoneyMarketHookTxBuilder(this.client, {
        initCore: this.params.initCoreProxy,
        wrappedNativeToken: this.params.wrappedNativeToken,
        accessControlManager: this.params.accessControlManager,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployInitCapitalMsg_4>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [DeployFeeVaultHash, deployRiskManagerHash, deployLendingPoolHash, deployMoneyMarketHookHash] = txHashes

    const { contractAddress: feeVault } = await this.client.publicClient.waitForTransactionReceipt({
      hash: DeployFeeVaultHash,
    })
    if (!feeVault) {
      throw new ContractNotFoundError(DeployFeeVaultHash, 'FeeVault')
    }
    registry['feeVault'] = feeVault

    const { contractAddress: riskManagerImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployRiskManagerHash,
    })
    if (!riskManagerImpl) {
      throw new ContractNotFoundError(deployRiskManagerHash, 'RiskManager')
    }
    registry['riskManagerImpl'] = riskManagerImpl

    const { contractAddress: lendingPoolImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployLendingPoolHash,
    })
    if (!lendingPoolImpl) {
      throw new ContractNotFoundError(deployLendingPoolHash, 'LendingPool')
    }
    registry['lendingPoolImpl'] = lendingPoolImpl

    const { contractAddress: moneyMarketHookImpl } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployMoneyMarketHookHash,
    })
    if (!moneyMarketHookImpl) {
      throw new ContractNotFoundError(deployMoneyMarketHookHash, 'MoneyMarketHook')
    }
    registry['moneyMarketHookImpl'] = moneyMarketHookImpl

    const newMessage: DeployInitCapitalMsg_4 = {
      riskManagerImpl,
      lendingPoolImpl,
      moneyMarketHookImpl,
    }

    return { newRegistry: registry, newMessage: newMessage }
  }
}
