import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type EnableFeeAmountTxBuilderParams = {
  factory: Address
  fee: number
  tickSpacing: number
}

export class EnableFeeAmountTxBuilder extends TxBuilder {
  private factory: Address
  private fee: number
  private tickSpacing: number

  constructor(client: InfinitWallet, params: EnableFeeAmountTxBuilderParams) {
    super(EnableFeeAmountTxBuilder.name, client)
    this.factory = getAddress(params.factory)
    this.fee = params.fee
    this.tickSpacing = params.tickSpacing
  }

  async buildTx(): Promise<TransactionData> {
    const uniswapV3FactoryArtifact = await readArtifact('UniswapV3Factory')
    const encodedData = encodeFunctionData({
      abi: uniswapV3FactoryArtifact.abi,
      functionName: 'enableFeeAmount',
      args: [this.fee, this.tickSpacing],
    })
    return {
      to: this.factory,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    if (this.factory === zeroAddress) throw new ValidateInputZeroAddressError('FACTORY')
    if (this.fee >= 1000000) throw new ValidateInputValueError('Fee cannot be greater than 1000000')
    if (this.tickSpacing >= 16384 || this.tickSpacing <= 0) throw new ValidateInputValueError('Tick spacing must be between 0 and 16384')

    const uniswapV3FactoryArtifact = await readArtifact('UniswapV3Factory')
    const owner = await this.client.publicClient.readContract({
      address: this.factory,
      abi: uniswapV3FactoryArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    if (this.client.walletClient.account.address !== owner) throw new ContractValidateError('only owner can enable fee amount')
    const fee = await this.client.publicClient.readContract({
      address: this.factory,
      abi: uniswapV3FactoryArtifact.abi,
      functionName: 'feeAmountTickSpacing',
      args: [this.fee],
    })
    if (fee !== 0) throw new ContractValidateError('fee amount already enabled')
  }
}
