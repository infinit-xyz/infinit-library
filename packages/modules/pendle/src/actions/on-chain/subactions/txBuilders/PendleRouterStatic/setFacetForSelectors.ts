import { Address, Hex, encodeFunctionData, getAddress, toFunctionSignature, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetFacetForSelectorsTxBuilderParams = {
  pendleRouterStatic: Address
  actionStorageStatic: Address
  actionInfoStatic: Address
  actionMarketAuxStatic: Address
  actionMarketCoreStatic: Address
  actionMintRedeemStatic: Address
  actionVePendleStatic: Address
}

export type FacetForSelectors = {
  facet: Address
  selectors: Hex[]
}

export class SetFacetForSelectorsTxBuilder extends TxBuilder {
  pendleRouterStatic: Address
  actionStorageStatic: Address
  actionInfoStatic: Address
  actionMarketAuxStatic: Address
  actionMarketCoreStatic: Address
  actionMintRedeemStatic: Address
  actionVePendleStatic: Address

  constructor(client: InfinitWallet, params: SetFacetForSelectorsTxBuilderParams) {
    super(SetFacetForSelectorsTxBuilder.name, client)
    this.pendleRouterStatic = getAddress(params.pendleRouterStatic)
    this.actionStorageStatic = getAddress(params.actionStorageStatic)
    this.actionInfoStatic = getAddress(params.actionInfoStatic)
    this.actionMarketAuxStatic = getAddress(params.actionMarketAuxStatic)
    this.actionMarketCoreStatic = getAddress(params.actionMarketCoreStatic)
    this.actionMintRedeemStatic = getAddress(params.actionMintRedeemStatic)
    this.actionVePendleStatic = getAddress(params.actionVePendleStatic)
  }

  async buildTx(): Promise<TransactionData> {
    const artifacts = await Promise.all([
      readArtifact('ActionStorageStatic'),
      readArtifact('ActionInfoStatic'),
      readArtifact('ActionMarketAuxStatic'),
      readArtifact('ActionMarketCoreStatic'),
      readArtifact('ActionMintRedeemStatic'),
      readArtifact('ActionVePendleStatic'),
    ])

    const infos = [
      { artifact: artifacts[0], address: this.actionStorageStatic },
      { artifact: artifacts[1], address: this.actionInfoStatic },
      { artifact: artifacts[2], address: this.actionMarketAuxStatic },
      { artifact: artifacts[3], address: this.actionMarketCoreStatic },
      { artifact: artifacts[4], address: this.actionMintRedeemStatic },
      { artifact: artifacts[5], address: this.actionVePendleStatic },
    ]

    const params: FacetForSelectors[] = infos.map((info) => {
      const selectors: Hex[] = info.artifact.abi
        .filter((element) => element.type === 'function' && element.name !== 'setFacetForSelectors')
        .map(
          (element) =>
            toFunctionSignature({
              name: element.name,
              type: element.type,
              inputs: element.inputs,
              outputs: element.outputs,
              stateMutability: element.stateMutability,
            }) as Hex,
        )

      return { facet: info.address, selectors }
    })

    const callData = encodeFunctionData({
      abi: artifacts[0].abi, // Use ActionStorageStatic's abi
      functionName: 'setFacetForSelectors',
      args: [params],
    })

    return {
      data: callData,
      to: this.pendleRouterStatic,
    }
  }

  public async validate(): Promise<void> {
    if (this.pendleRouterStatic === zeroAddress) {
      throw new ValidateInputZeroAddressError('PendleRouterStatic')
    }
    if (this.actionStorageStatic === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionStorageStatic')
    }
    if (this.actionInfoStatic === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionInfoStatic')
    }
    if (this.actionMarketAuxStatic === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionMarketAuxStatic')
    }
    if (this.actionMarketCoreStatic === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionMarketCoreStatic')
    }
    if (this.actionMintRedeemStatic === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionMintRedeemStatic')
    }
    if (this.actionVePendleStatic === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionVePendleStatic')
    }
  }
}
