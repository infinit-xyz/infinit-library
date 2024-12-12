import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployActionAddRemoveLiqV3TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/facets/ActionAddRemoveLiqV3/deploy'
import { DeployActionCallbackV3TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/facets/ActionCallbackV3/deploy'
import { DeployActionMiscV3TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/facets/ActionMiscV3/deploy'
import { DeployActionSimpleTxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/facets/ActionSimple/deploy'
import { DeployActionSwapPTV3TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/facets/ActionSwapPTV3/deploy'
import { DeployActionSwapYTV3TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/facets/ActionSwapYTV3/deploy'
import { DeployActionStorageV4TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/RouterStorageV4/deploy'
import { PendleRegistry } from '@/src/type'

export type DeployPendleRouterFacetsParams = {}

export type DeployPendleRouterFacetsMsg = {
  routerStorageV4: Address
  actionAddRemoveLiqV3: Address
  actionCallbackV3: Address
  actionMiscV3: Address
  actionSimple: Address
  actionSwapPTV3: Address
  actionSwapYTV3: Address
}

export class DeployPendleRouterFacets1SubAction extends SubAction<
  DeployPendleRouterFacetsParams,
  PendleRegistry,
  DeployPendleRouterFacetsMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleRouterFacetsParams) {
    super(DeployPendleRouterFacets1SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new DeployActionStorageV4TxBuilder(this.client))
    this.txBuilders.push(new DeployActionAddRemoveLiqV3TxBuilder(this.client))
    this.txBuilders.push(new DeployActionCallbackV3TxBuilder(this.client))
    this.txBuilders.push(new DeployActionMiscV3TxBuilder(this.client))
    this.txBuilders.push(new DeployActionSimpleTxBuilder(this.client))
    this.txBuilders.push(new DeployActionSwapPTV3TxBuilder(this.client))
    this.txBuilders.push(new DeployActionSwapYTV3TxBuilder(this.client))
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleRouterFacetsMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [
      deployRouterStorageV4Hash,
      deployAddRemoveLiqV3Hash,
      deployCallbackV3Hash,
      deployMiscV3Hash,
      deploySimpleHash,
      deploySwapPTV3Hash,
      deploySwapYTV3Hash,
    ] = txHashes

    const { contractAddress: routerStorageV4 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployRouterStorageV4Hash,
    })
    if (!routerStorageV4) {
      throw new ContractNotFoundError(deployRouterStorageV4Hash, 'PendleRouterV4')
    }
    registry['routerStorageV4'] = routerStorageV4

    const { contractAddress: actionAddRemoveLiqV3 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployAddRemoveLiqV3Hash,
    })
    if (!actionAddRemoveLiqV3) {
      throw new ContractNotFoundError(deployAddRemoveLiqV3Hash, 'AddRemoveLiqV3')
    }
    registry['actionAddRemoveLiqV3'] = actionAddRemoveLiqV3

    const { contractAddress: actionCallbackV3 } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployCallbackV3Hash })
    if (!actionCallbackV3) {
      throw new ContractNotFoundError(deployCallbackV3Hash, 'CallbackV3')
    }
    registry['actionCallbackV3'] = actionCallbackV3

    const { contractAddress: actionMiscV3 } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployMiscV3Hash })
    if (!actionMiscV3) {
      throw new ContractNotFoundError(deployMiscV3Hash, 'MiscV3')
    }
    registry['actionMiscV3'] = actionMiscV3

    const { contractAddress: actionSimple } = await this.client.publicClient.waitForTransactionReceipt({ hash: deploySimpleHash })
    if (!actionSimple) {
      throw new ContractNotFoundError(deploySimpleHash, 'Simple')
    }
    registry['actionSimple'] = actionSimple

    const { contractAddress: actionSwapPTV3 } = await this.client.publicClient.waitForTransactionReceipt({ hash: deploySwapPTV3Hash })
    if (!actionSwapPTV3) {
      throw new ContractNotFoundError(deploySwapPTV3Hash, 'SwapPTV3')
    }
    registry['actionSwapPTV3'] = actionSwapPTV3

    const { contractAddress: actionSwapYTV3 } = await this.client.publicClient.waitForTransactionReceipt({ hash: deploySwapYTV3Hash })
    if (!actionSwapYTV3) {
      throw new ContractNotFoundError(deploySwapYTV3Hash, 'SwapYTV3')
    }
    registry['actionSwapYTV3'] = actionSwapYTV3

    const newMessage: DeployPendleRouterFacetsMsg = {
      routerStorageV4,
      actionAddRemoveLiqV3,
      actionCallbackV3,
      actionMiscV3,
      actionSimple,
      actionSwapPTV3,
      actionSwapYTV3,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
