import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetOwnerTxBuilderParams = {
  factory: Address
  newOwner: Address
}

export class SetOwnerTxBuilder extends TxBuilder {
  private factory: Address
  private newOwner: Address

  constructor(client: InfinitWallet, params: SetOwnerTxBuilderParams) {
    super(SetOwnerTxBuilder.name, client)
    this.factory = getAddress(params.factory)
    this.newOwner = getAddress(params.newOwner)
  }

  async buildTx(): Promise<TransactionData> {
    const uniswapV3FactoryArtifact = await readArtifact('UniswapV3Factory')
    const encodedData = encodeFunctionData({ abi: uniswapV3FactoryArtifact.abi, functionName: 'setOwner', args: [this.newOwner] })
    return {
      to: this.factory,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    if (this.factory === zeroAddress) throw new ValidateInputZeroAddressError('FACTORY')
    const uniswapV3FactoryArtifact = await readArtifact('UniswapV3Factory')
    const owner = await this.client.publicClient.readContract({
      address: this.factory,
      abi: uniswapV3FactoryArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    if (this.client.walletClient.account.address !== owner) throw new ContractValidateError('only owner can set owner')
  }
}
