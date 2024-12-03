import { Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import { DeployMulticall2TxBuilder } from '@actions/subactions/tx-builders/Multicall2/deploy'
import { DeployPendleMulticallV2TxBuilder } from '@actions/subactions/tx-builders/PendleMulticallV2/deploy'
import { DeploySimulateHelperTxBuilder } from '@actions/subactions/tx-builders/SimulateHelper/deploy'
import { DeploySupplyCapReaderTxBuilder } from '@actions/subactions/tx-builders/SupplyCapReader/deploy'

import { PendleRegistry } from '@/src/type'

export class DeployOffChainHelpersSubAction extends SubAction<{}, {}> {
  constructor(client: InfinitWallet, params: {}) {
    super(DeployOffChainHelpersSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // deploy multicall2
    const deployMulticall2TxBuilder = new DeployMulticall2TxBuilder(this.client, {})
    this.txBuilders.push(deployMulticall2TxBuilder)

    // deploy pendleMulticallV2
    const deployPendleMulticall2TxBuilder = new DeployPendleMulticallV2TxBuilder(this.client, {})
    this.txBuilders.push(deployPendleMulticall2TxBuilder)

    // deploy simulateHelper
    const deploySimulateHelperTxBuilder = new DeploySimulateHelperTxBuilder(this.client, {})
    this.txBuilders.push(deploySimulateHelperTxBuilder)

    // deploy supplyCapReader
    const deploySupplyCapReaderTxBuilder = new DeploySupplyCapReaderTxBuilder(this.client, {})
    this.txBuilders.push(deploySupplyCapReaderTxBuilder)
  }

  public async updateRegistryAndMessage(registry: PendleRegistry, txHashes: Hex[]): Promise<SubActionExecuteResponse<{}>> {
    // get tx hashes
    const [deployMulticall2Hash, deployPendleMulticall2Hash, deploySimulateHelperHash, deploySupplyCapReaderHash] = txHashes

    // registers multicall2
    const { contractAddress: multicall2 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployMulticall2Hash,
    })
    if (!multicall2) {
      throw new ContractNotFoundError(deployMulticall2Hash, 'Multicall2')
    }
    registry['multicall'] = multicall2

    // registers pendleMulticallV2
    const { contractAddress: pendleMulticallV2 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleMulticall2Hash,
    })
    if (!pendleMulticallV2) {
      throw new ContractNotFoundError(deployPendleMulticall2Hash, 'PendleMulticallV2')
    }
    registry['pendleMulticallV2'] = pendleMulticallV2

    // registers simulateHelper
    const { contractAddress: simulateHelper } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deploySimulateHelperHash,
    })
    if (!simulateHelper) {
      throw new ContractNotFoundError(deploySimulateHelperHash, 'SimulateHelper')
    }
    registry['simulateHelper'] = simulateHelper

    // registers supplyCapReader
    const { contractAddress: supplyCapReader } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deploySupplyCapReaderHash,
    })
    if (!supplyCapReader) {
      throw new ContractNotFoundError(deploySupplyCapReaderHash, 'SupplyCapReader')
    }
    registry['supplyCapReader'] = supplyCapReader

    return { newRegistry: registry, newMessage: {} }
  }
}
