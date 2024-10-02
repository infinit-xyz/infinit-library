import { Libraries, resolveBytecodeWithLinkedLibraries } from '@nomicfoundation/hardhat-viem/internal/bytecode.js'
import { Address, Hex, encodeDeployData, getAddress, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployNonfungibleTokenPositionDescriptorTxBuilderParams = {
  weth9: Address
  nativeCurrencyLabel: string
  nftDescriptor: Address
}

export class DeployNonfungibleTokenPositionDescriptorTxBuilder extends TxBuilder {
  private weth9: Address
  private nativeCurrencyLabelBytes: Hex
  private nftDescriptor: Address

  constructor(client: InfinitWallet, params: DeployNonfungibleTokenPositionDescriptorTxBuilderParams) {
    super(DeployNonfungibleTokenPositionDescriptorTxBuilder.name, client)
    this.weth9 = getAddress(params.weth9)
    this.nativeCurrencyLabelBytes = toHex(params.nativeCurrencyLabel, { size: 32 })
    this.nftDescriptor = getAddress(params.nftDescriptor)
  }

  async buildTx(): Promise<TransactionData> {
    const nonfungibleTokenPositionDescriptorArtifact = await readArtifact('NonfungibleTokenPositionDescriptor')
    const libraries: Libraries<Address> = {
      NFTDescriptor: this.nftDescriptor,
    }
    const bytecode: Hex = await resolveBytecodeWithLinkedLibraries(nonfungibleTokenPositionDescriptorArtifact, libraries)
    const deployData: Hex = encodeDeployData({
      abi: nonfungibleTokenPositionDescriptorArtifact.abi,
      bytecode: bytecode,
      args: [this.weth9, this.nativeCurrencyLabelBytes],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.weth9 === zeroAddress) throw new ValidateInputZeroAddressError('WETH9')
    if (this.nftDescriptor === zeroAddress) throw new ValidateInputZeroAddressError('NFT_DESCRIPTOR')
  }
}
