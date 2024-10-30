import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { InitializeConfigTxBuilder } from '@actions/subactions/tx-builders/Config/initialize'
import { InitializeInitCoreTxBuilder } from '@actions/subactions/tx-builders/InitCore/initialize'
import { DeployInitLensTxBuilder } from '@actions/subactions/tx-builders/InitLens/deploy'
import { InitializeInitOracleTxBuilder } from '@actions/subactions/tx-builders/InitOracle/initialize'
import { InitializeLiqIncentiveCalculatorTxBuilder } from '@actions/subactions/tx-builders/LiqIncentiveCalculator/initialize'
import { InitializeMoneyMarketHookTxBuilder } from '@actions/subactions/tx-builders/MoneyMarketHook/initialize'
import { InitializePosManagerTxBuilder } from '@actions/subactions/tx-builders/PosManager/initialize'
import { InitializeRiskManagerTxBuilder } from '@actions/subactions/tx-builders/RiskManager/initialize'

import { InitCapitalRegistry } from '@/src/type'

export type DeployInitCapitalContracts_6SubActionParams = {
  initCoreProxy: Address
  posManagerProxy: Address
  accessControlManager: Address
  nftName: string
  nftSymbol: string
  maxCollCount: number
  configProxy: Address
  initOracleProxy: Address
  riskManagerProxy: Address
  moneyMarketHookProxy: Address
  liqIncentiveCalculatorProxy: Address
  maxLiqIncentiveMultiplier: bigint
}

export type DeployInitCapitalMsg_6 = {
  initLens: Address
}

export class DeployInitCapitalContracts6SubAction extends SubAction<
  DeployInitCapitalContracts_6SubActionParams,
  InitCapitalRegistry,
  DeployInitCapitalMsg_6
> {
  constructor(client: InfinitWallet, params: DeployInitCapitalContracts_6SubActionParams) {
    super(DeployInitCapitalContracts6SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // ----------- initialize -----------
    // initialize init oracle
    this.txBuilders.push(new InitializeInitOracleTxBuilder(this.client, { initOracle: this.params.initOracleProxy }))
    // initialize config
    this.txBuilders.push(new InitializeConfigTxBuilder(this.client, { config: this.params.configProxy }))
    // initialize liq incentive calculator
    this.txBuilders.push(
      new InitializeLiqIncentiveCalculatorTxBuilder(this.client, {
        liqIncentiveCalculator: this.params.liqIncentiveCalculatorProxy,
        maxLiqIncentiveMultiplier: this.params.maxLiqIncentiveMultiplier,
      }),
    )
    // initialize risk manager
    this.txBuilders.push(new InitializeRiskManagerTxBuilder(this.client, { riskManager: this.params.riskManagerProxy }))
    // initialize money market hook
    this.txBuilders.push(new InitializeMoneyMarketHookTxBuilder(this.client, { moneyMarketHook: this.params.moneyMarketHookProxy }))
    // initialize pos manager
    this.txBuilders.push(
      new InitializePosManagerTxBuilder(this.client, {
        posManager: this.params.posManagerProxy,
        nftName: this.params.nftName,
        nftSymbol: this.params.nftSymbol,
        initCore: this.params.initCoreProxy,
        maxCollCount: this.params.maxCollCount,
      }),
    )
    // initialize init core
    this.txBuilders.push(
      new InitializeInitCoreTxBuilder(this.client, {
        initCore: this.params.initCoreProxy,
        config: this.params.configProxy,
        initOracle: this.params.initOracleProxy,
        liqIncentiveCalculator: this.params.initCoreProxy,
        riskManager: this.params.riskManagerProxy,
      }),
    )
    // ----------- lens -----------
    this.txBuilders.push(
      new DeployInitLensTxBuilder(this.client, {
        initCore: this.params.initCoreProxy,
        posManager: this.params.posManagerProxy,
        riskManager: this.params.riskManagerProxy,
        config: this.params.configProxy,
      }),
    )
  }

  public async updateRegistryAndMessage(
    registry: InitCapitalRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<InitCapitalRegistry, DeployInitCapitalMsg_6>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [
      _initializeInitOracleHash,
      _initializeConfigHash,
      _initializeLiqIncentiveCalculatorHash,
      _initializeRiskManagerHash,
      _initializeMoneyMarketHookHash,
      _initializePosManagerHash,
      _initializeInitCoreHash,
      deployInitLensHash,
    ] = txHashes

    const { contractAddress: initLens } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployInitLensHash,
    })
    if (!initLens) {
      throw new ContractNotFoundError(deployInitLensHash, 'InitLens')
    }
    registry['initLens'] = initLens

    const newMessage: DeployInitCapitalMsg_6 = {
      initLens,
    }

    return { newRegistry: registry, newMessage: newMessage }
  }
}
