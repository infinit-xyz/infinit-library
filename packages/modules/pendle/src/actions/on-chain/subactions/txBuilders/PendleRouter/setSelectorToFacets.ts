import { Address, Hex, encodeFunctionData, getAddress, toFunctionSignature, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetSelectorToFacetsTxBuilderParams = {
  pendleRouter: Address
  actionStorageV4: Address
  actionAddRemoveLiqV3: Address
  actionCallbackV3: Address
  actionMiscV3: Address
  actionSimple: Address
  actionSwapPTV3: Address
  actionSwapYTV3: Address
}

export type FacetForSelectors = {
  facet: Address
  selectors: Hex[]
}

export class SetSelectorToFacetsTxBuilder extends TxBuilder {
  pendleRouter: Address
  actionStorageV4: Address
  actionAddRemoveLiqV3: Address
  actionCallbackV3: Address
  actionMiscV3: Address
  actionSimple: Address
  actionSwapPTV3: Address
  actionSwapYTV3: Address

  constructor(client: InfinitWallet, params: SetSelectorToFacetsTxBuilderParams) {
    super(SetSelectorToFacetsTxBuilder.name, client)
    this.pendleRouter = getAddress(params.pendleRouter)
    this.actionStorageV4 = getAddress(params.actionStorageV4)
    this.actionAddRemoveLiqV3 = getAddress(params.actionAddRemoveLiqV3)
    this.actionCallbackV3 = getAddress(params.actionCallbackV3)
    this.actionMiscV3 = getAddress(params.actionMiscV3)
    this.actionSimple = getAddress(params.actionSimple)
    this.actionSwapPTV3 = getAddress(params.actionSwapPTV3)
    this.actionSwapYTV3 = getAddress(params.actionSwapYTV3)
  }

  async buildTx(): Promise<TransactionData> {
    const artifacts = await Promise.all([
      readArtifact('ActionStorageV4'),
      readArtifact('ActionAddRemoveLiqV3'),
      readArtifact('ActionCallbackV3'),
      readArtifact('ActionMiscV3'),
      readArtifact('ActionSimple'),
      readArtifact('ActionSwapPTV3'),
      readArtifact('ActionSwapYTV3'),
    ])

    const infos = [
      { artifact: artifacts[0], address: this.actionStorageV4 },
      { artifact: artifacts[1], address: this.actionAddRemoveLiqV3 },
      { artifact: artifacts[2], address: this.actionCallbackV3 },
      { artifact: artifacts[3], address: this.actionMiscV3 },
      { artifact: artifacts[4], address: this.actionSimple },
      { artifact: artifacts[5], address: this.actionSwapPTV3 },
      { artifact: artifacts[6], address: this.actionSwapYTV3 },
    ]

    const params: FacetForSelectors[] = infos.map((info) => {
      const selectors: Hex[] = info.artifact.abi
        .filter((element) => element.type === 'function' && element.name !== 'setSelectorToFacets')
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
      abi: artifacts[0].abi, // Use ActionStorage's abi
      functionName: 'setSelectorToFacets',
      args: [params],
    })

    return {
      data: callData,
      to: this.pendleRouter,
    }
  }

  public async validate(): Promise<void> {
    if (this.pendleRouter === zeroAddress) {
      throw new ValidateInputZeroAddressError('PendleRouter')
    }
    if (this.actionStorageV4 === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionStorageV4')
    }
    if (this.actionAddRemoveLiqV3 === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionAddRemoveLiqV3')
    }
    if (this.actionCallbackV3 === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionCallbackV3')
    }
    if (this.actionMiscV3 === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionMiscV3')
    }
    if (this.actionSimple === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionSimple')
    }
    if (this.actionSwapPTV3 === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionSwapPTV3')
    }
    if (this.actionSwapYTV3 === zeroAddress) {
      throw new ValidateInputZeroAddressError('ActionSwapYTV3')
    }
  }
}
