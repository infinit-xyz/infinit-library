import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type CollectProtocolTxBuilderParams = {
  pool: Address
  recipient: Address
  amount0Requested?: bigint
  amount1Requested?: bigint
}

export type ProtocolFees = {
  token0: bigint
  token1: bigint
}

export class CollectProtocolTxBuilder extends TxBuilder {
  private pool: Address
  private recipient: Address
  private amount0Requested?: bigint
  private amount1Requested?: bigint

  constructor(client: InfinitWallet, params: CollectProtocolTxBuilderParams) {
    super(CollectProtocolTxBuilder.name, client)
    this.pool = getAddress(params.pool)
    this.recipient = getAddress(params.recipient)
    this.amount0Requested = params.amount0Requested
    this.amount1Requested = params.amount1Requested
  }

  async buildTx(): Promise<TransactionData> {
    const uniswapV3PoolArtifact = await readArtifact('UniswapV3Pool')
    const protocolFees: ProtocolFees = await this.getProtocolFees(this.client)
    const amount0Requested = this.amount0Requested ?? protocolFees.token0
    const amount1Requested = this.amount1Requested ?? protocolFees.token1
    const encodedData = encodeFunctionData({
      abi: uniswapV3PoolArtifact.abi,
      functionName: 'collectProtocol',
      args: [this.recipient, amount0Requested, amount1Requested],
    })
    return {
      to: this.pool,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    if (this.pool === zeroAddress) throw new ValidateInputZeroAddressError('POOL')
    if (this.recipient === zeroAddress) throw new ValidateInputValueError('RECIPIENT')
    const protocolFees: ProtocolFees = await this.getProtocolFees(this.client)
    if (this.amount0Requested && this.amount0Requested > protocolFees.token0)
      throw new ContractValidateError('Requested amount0 exceeds protocol fees')
    if (this.amount1Requested && this.amount1Requested > protocolFees.token1)
      throw new ContractValidateError('Requested amount1 exceeds protocol fees')
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

  private async getProtocolFees(client: InfinitWallet): Promise<ProtocolFees> {
    const uniswapV3PoolArtifact = await readArtifact('UniswapV3Pool')
    const protocolFees: [bigint, bigint] = await client.publicClient.readContract({
      address: this.pool,
      abi: uniswapV3PoolArtifact.abi,
      functionName: 'protocolFees',
      args: [],
    })
    return {
      token0: protocolFees[0],
      token1: protocolFees[1],
    }
  }
}
