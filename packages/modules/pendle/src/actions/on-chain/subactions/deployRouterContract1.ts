import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployActionStorageStaticTxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/ActionStorageStatic/deploy'
import { DeployPendleLimitRouterTxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleLimitRouter/deploy'
import { DeployActionAddRemoveLiqV3TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/facets/ActionAddRemoveLiqV3/deploy'
import { DeployActionCallbackV3TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/facets/ActionCallbackV3/deploy'
import { DeployActionMiscV3TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/facets/ActionMiscV3/deploy'
import { DeployActionSimpleTxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/facets/ActionSimple/deploy'
import { DeployActionSwapPTV3TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/facets/ActionSwapPTV3/deploy'
import { DeployActionSwapYTV3TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouter/facets/ActionSwapYTV3/deploy'
import { DeployActionInfoStaticTxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouterStatic/facets/ActionInfoStatic/deploy'
import { DeployActionMarketAuxStaticTxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouterStatic/facets/ActionMarketAuxStatic/deploy'
import { DeployActionMarketCoreStaticTxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouterStatic/facets/ActionMarketCoreStatic/deploy'
import { DeployActionMintRedeemStaticTxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouterStatic/facets/ActionMintRedeemStatic/deploy'
import { DeployActionVePendleStaticTxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/PendleRouterStatic/facets/ActionVePendleStatic/deploy'
import { DeployActionStorageV4TxBuilder } from '@/src/temp/actions/on-chain/subactions/txBuilders/RouterStorageV4/deploy'
import { PendleRegistry } from '@/src/type'

export type DeployPendleRouterContractSubactionParams = {
  owner: Address
  wrappedNativeToken: Address
}

export type DeployPendleRouterContractMsg_1 = {
  routerStorageV4: Address
  actionAddRemoveLiqV3: Address
  actionCallbackV3: Address
  actionMiscV3: Address
  actionSimple: Address
  actionSwapPTV3: Address
  actionSwapYTV3: Address
  actionStorageStatic: Address
  actionInfoStatic: Address
  actionMarketAuxStatic: Address
  actionMarketCoreStatic: Address
  actionMintRedeemStatic: Address
  actionVePendleStatic: Address
  pendleLimitRouter: Address
}

export class DeployPendleRouterContract1SubAction extends SubAction<
  DeployPendleRouterContractSubactionParams,
  PendleRegistry,
  DeployPendleRouterContractMsg_1
> {
  constructor(client: InfinitWallet, params: DeployPendleRouterContractSubactionParams) {
    super(DeployPendleRouterContract1SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new DeployActionStorageV4TxBuilder(this.client))
    this.txBuilders.push(new DeployActionAddRemoveLiqV3TxBuilder(this.client))
    this.txBuilders.push(new DeployActionCallbackV3TxBuilder(this.client))
    this.txBuilders.push(new DeployActionMiscV3TxBuilder(this.client))
    this.txBuilders.push(new DeployActionSimpleTxBuilder(this.client))
    this.txBuilders.push(new DeployActionSwapPTV3TxBuilder(this.client))
    this.txBuilders.push(new DeployActionSwapYTV3TxBuilder(this.client))
    this.txBuilders.push(new DeployActionStorageStaticTxBuilder(this.client))
    this.txBuilders.push(new DeployActionInfoStaticTxBuilder(this.client))
    this.txBuilders.push(new DeployActionMarketAuxStaticTxBuilder(this.client))
    this.txBuilders.push(new DeployActionMarketCoreStaticTxBuilder(this.client))
    this.txBuilders.push(new DeployActionMintRedeemStaticTxBuilder(this.client))
    this.txBuilders.push(new DeployActionVePendleStaticTxBuilder(this.client))
    this.txBuilders.push(new DeployPendleLimitRouterTxBuilder(this.client, { wrappedNativeToken: this.params.wrappedNativeToken }))
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleRouterContractMsg_1>> {
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
      deployActionStorageStaticHash,
      deployActionInfoStaticHash,
      deployActionMarketAuxStaticHash,
      deployActionMarketCoreStaticHash,
      deployActionMintRedeemStaticHash,
      deployActionVePendleStaticHash,
      deployPendleLimitRouterHash,
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

    const { contractAddress: actionStorageStatic } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployActionStorageStaticHash,
    })
    if (!actionStorageStatic) {
      throw new ContractNotFoundError(deployActionStorageStaticHash, 'ActionStorageStatic')
    }
    registry['actionStorageStatic'] = actionStorageStatic

    const { contractAddress: actionInfoStatic } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployActionInfoStaticHash,
    })
    if (!actionInfoStatic) {
      throw new ContractNotFoundError(deployActionInfoStaticHash, 'ActionInfoStatic')
    }
    registry['actionInfoStatic'] = actionInfoStatic

    const { contractAddress: actionMarketAuxStatic } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployActionMarketAuxStaticHash,
    })
    if (!actionMarketAuxStatic) {
      throw new ContractNotFoundError(deployActionMarketAuxStaticHash, 'ActionMarketAuxStatic')
    }
    registry['actionMarketAuxStatic'] = actionMarketAuxStatic

    const { contractAddress: actionMarketCoreStatic } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployActionMarketCoreStaticHash,
    })
    if (!actionMarketCoreStatic) {
      throw new ContractNotFoundError(deployActionMarketCoreStaticHash, 'ActionMarketCoreStatic')
    }
    registry['actionMarketCoreStatic'] = actionMarketCoreStatic

    const { contractAddress: actionMintRedeemStatic } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployActionMintRedeemStaticHash,
    })
    if (!actionMintRedeemStatic) {
      throw new ContractNotFoundError(deployActionMintRedeemStaticHash, 'ActionMintRedeemStatic')
    }
    registry['actionMintRedeemStatic'] = actionMintRedeemStatic

    const { contractAddress: actionVePendleStatic } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployActionVePendleStaticHash,
    })
    if (!actionVePendleStatic) {
      throw new ContractNotFoundError(deployActionVePendleStaticHash, 'ActionVePendleStatic')
    }
    registry['actionVePendleStatic'] = actionVePendleStatic

    const { contractAddress: pendleLimitRouter } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployPendleLimitRouterHash,
    })
    if (!pendleLimitRouter) {
      throw new ContractNotFoundError(deployPendleLimitRouterHash, 'PendleLimitRouter')
    }
    registry['pendleLimitRouter'] = pendleLimitRouter

    const newMessage: DeployPendleRouterContractMsg_1 = {
      routerStorageV4,
      actionAddRemoveLiqV3,
      actionCallbackV3,
      actionMiscV3,
      actionSimple,
      actionSwapPTV3,
      actionSwapYTV3,
      actionStorageStatic,
      actionInfoStatic,
      actionMarketAuxStatic,
      actionMarketCoreStatic,
      actionMintRedeemStatic,
      actionVePendleStatic,
      pendleLimitRouter,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
