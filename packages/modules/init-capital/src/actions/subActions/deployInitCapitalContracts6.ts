import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { InitializeInitCoreTxBuilder } from '@actions/subactions/tx-builders/InitCore/initialize'
import { DeployInitLensTxBuilder } from '@actions/subactions/tx-builders/InitLens/deploy'
import { InitializePosManagerTxBuilder } from '@actions/subactions/tx-builders/PosManager/initialize'

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
    this.txBuilders.push(
      new InitializePosManagerTxBuilder(this.client, {
        posManager: this.params.posManagerProxy,
        nftName: this.params.nftName,
        nftSymbol: this.params.nftSymbol,
        initCore: this.params.initCoreProxy,
        maxCollCount: this.params.maxCollCount,
      }),
    )
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

    const [_initializePosManagerHash, _initializeInitCoreHash, deployInitLensHash] = txHashes

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
