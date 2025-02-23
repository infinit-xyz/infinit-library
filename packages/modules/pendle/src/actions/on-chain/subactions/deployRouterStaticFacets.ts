import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError, TxNotFoundError } from '@infinit-xyz/core/errors'

import { DeployActionInfoStaticTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouterStatic/facets/ActionInfoStatic/deploy'
import { DeployActionMarketAuxStaticTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouterStatic/facets/ActionMarketAuxStatic/deploy'
import { DeployActionMarketCoreStaticTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouterStatic/facets/ActionMarketCoreStatic/deploy'
import { DeployActionMintRedeemStaticTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouterStatic/facets/ActionMintRedeemStatic/deploy'
import { DeployActionStorageStaticTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouterStatic/facets/ActionStorageStatic/deploy'
import { DeployActionVePendleStaticTxBuilder } from '@actions/on-chain/subactions/txBuilders/PendleRouterStatic/facets/ActionVePendleStatic/deploy'

import { PendleRegistry } from '@/src/type'

export type DeployPendleStaticFacetsSubactionParams = {
  owner: Address
  vePendle: Address
}

export type DeployPendleStaticFacetsMsg = {
  actionStorageStatic: Address
  actionInfoStatic: Address
  actionMarketAuxStatic: Address
  actionMarketCoreStatic: Address
  actionMintRedeemStatic: Address
  actionVePendleStatic: Address
}

export class DeployPendleStaticFacetsSubAction extends SubAction<
  DeployPendleStaticFacetsSubactionParams,
  PendleRegistry,
  DeployPendleStaticFacetsMsg
> {
  constructor(client: InfinitWallet, params: DeployPendleStaticFacetsSubactionParams) {
    super(DeployPendleStaticFacetsSubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    this.txBuilders.push(new DeployActionStorageStaticTxBuilder(this.client))
    this.txBuilders.push(new DeployActionInfoStaticTxBuilder(this.client))
    this.txBuilders.push(new DeployActionMarketAuxStaticTxBuilder(this.client))
    this.txBuilders.push(new DeployActionMarketCoreStaticTxBuilder(this.client))
    this.txBuilders.push(new DeployActionMintRedeemStaticTxBuilder(this.client))
    this.txBuilders.push(new DeployActionVePendleStaticTxBuilder(this.client, { vePendle: this.params.vePendle }))
  }

  public async updateRegistryAndMessage(
    registry: PendleRegistry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<PendleRegistry, DeployPendleStaticFacetsMsg>> {
    if (txHashes.some((v) => !v)) {
      throw new TxNotFoundError()
    }

    const [
      deployActionStorageStaticHash,
      deployActionInfoStaticHash,
      deployActionMarketAuxStaticHash,
      deployActionMarketCoreStaticHash,
      deployActionMintRedeemStaticHash,
      deployActionVePendleStaticHash,
    ] = txHashes

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

    const newMessage: DeployPendleStaticFacetsMsg = {
      actionStorageStatic,
      actionInfoStatic,
      actionMarketAuxStatic,
      actionMarketCoreStatic,
      actionMintRedeemStatic,
      actionVePendleStatic,
    }
    return { newRegistry: registry, newMessage: newMessage }
  }
}
