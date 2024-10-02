import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetFeeProtocolTxBuilderParams = {
  pool: Address
  feeProtocol0: number
  feeProtocol1: number
}

export class SetFeeProtocolTxBuilder extends TxBuilder {
  private pool: Address
  private feeProtocol0: number
  private feeProtocol1: number

  constructor(client: InfinitWallet, params: SetFeeProtocolTxBuilderParams) {
    super(SetFeeProtocolTxBuilder.name, client)
    this.pool = getAddress(params.pool)
    this.feeProtocol0 = params.feeProtocol0
    this.feeProtocol1 = params.feeProtocol1
  }

  async buildTx(): Promise<TransactionData> {
    const uniswapV3PoolArtifact = await readArtifact('UniswapV3Pool')
    const encodedData = encodeFunctionData({
      abi: uniswapV3PoolArtifact.abi,
      functionName: 'setFeeProtocol',
      args: [this.feeProtocol0, this.feeProtocol1],
    })
    return {
      to: this.pool,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    if (this.pool === zeroAddress) throw new ValidateInputZeroAddressError('POOL')
    if (this.feeProtocol0 !== 0 && (this.feeProtocol0 < 4 || this.feeProtocol0 > 10))
      throw new ValidateInputValueError('Fee protocol0 must be 0 or between 4 and 10')
    if (this.feeProtocol1 !== 0 && (this.feeProtocol1 < 4 || this.feeProtocol1 > 10))
      throw new ValidateInputValueError('Fee protocol1 must be 0 or between 4 and 10')
    const uniswapV3PoolArtifact = await readArtifact('UniswapV3Pool')
    const factory = await this.client.publicClient.readContract({
      address: this.pool,
      abi: uniswapV3PoolArtifact.abi,
      functionName: 'factory',
      args: [],
    })
    const uniswapV3FactoryArtifact = await readArtifact('UniswapV3Factory')
    const owner = await this.client.publicClient.readContract({
      address: factory,
      abi: uniswapV3FactoryArtifact.abi,
      functionName: 'owner',
      args: [],
    })
    if (this.client.walletClient.account.address !== owner) throw new ContractValidateError('only owner can set fee protocol')
  }
}
