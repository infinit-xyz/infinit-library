import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployNonfungiblePositionManagerParams = {
  factory: Address
  weth9: Address
  tokenDescriptor: Address
}

export class DeployNonfungiblePositionManagerTxBuilder extends TxBuilder {
  private factory: Address
  private weth9: Address
  private tokenDescriptor: Address

  constructor(client: InfinitWallet, params: DeployNonfungiblePositionManagerParams) {
    super(DeployNonfungiblePositionManagerTxBuilder.name, client)
    this.factory = getAddress(params.factory)
    this.weth9 = getAddress(params.weth9)
    this.tokenDescriptor = getAddress(params.tokenDescriptor)
  }

  async buildTx(): Promise<TransactionData> {
    const nonfungiblePositionManagerArtifact = await readArtifact('NonfungiblePositionManager')

    const deployData: Hex = encodeDeployData({
      abi: nonfungiblePositionManagerArtifact.abi,
      bytecode: nonfungiblePositionManagerArtifact.bytecode as Hex,
      args: [this.factory, this.weth9, this.tokenDescriptor],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.factory === zeroAddress) throw new ValidateInputValueError('factory cannot be zero address')
    if (this.weth9 === zeroAddress) throw new ValidateInputValueError('weth9 cannot be zero address')
    if (this.tokenDescriptor === zeroAddress) throw new ValidateInputValueError('TokenDescriptor cannot be zero address')
  }
}
