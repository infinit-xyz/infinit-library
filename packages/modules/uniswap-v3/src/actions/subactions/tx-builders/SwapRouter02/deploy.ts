import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeploySwapRouter02TxBuilderParams = {
  factoryV2?: Address
  factoryV3: Address
  positionManager: Address
  weth9: Address
}

export class DeploySwapRouter02TxBuilder extends TxBuilder {
  private factoryV2: Address
  private factoryV3: Address
  private positionManager: Address
  private weth9: Address

  constructor(client: InfinitWallet, params: DeploySwapRouter02TxBuilderParams) {
    super(DeploySwapRouter02TxBuilder.name, client)
    this.factoryV2 = params.factoryV2 ?? zeroAddress
    this.factoryV2 = getAddress(this.factoryV2)
    this.factoryV3 = getAddress(params.factoryV3)
    this.positionManager = getAddress(params.positionManager)
    this.weth9 = getAddress(params.weth9)
  }

  async buildTx(): Promise<TransactionData> {
    const swapRouterArtifact = await readArtifact('SwapRouter02')

    const deployData: Hex = encodeDeployData({
      abi: swapRouterArtifact.abi,
      bytecode: swapRouterArtifact.bytecode as Hex,
      args: [this.factoryV2, this.factoryV3, this.positionManager, this.weth9],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  async validate(): Promise<void> {
    if (this.factoryV3 === zeroAddress) throw new ValidateInputZeroAddressError('FACTORY_V3')
    if (this.positionManager === zeroAddress) throw new ValidateInputZeroAddressError('POSITION_MANAGER')
    if (this.weth9 === zeroAddress) throw new ValidateInputZeroAddressError('WETH9')
  }
}
