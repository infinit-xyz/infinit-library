import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeLendingPoolTxBuilderParams = {
  lendingPool: Address
  underlingToken: Address
  name: string
  symbol: string
  irm: Address
  reserveFactor: bigint
  treasury: Address
}

export class InitializeLendingPoolTxBuilder extends TxBuilder {
  public lendingPool: Address
  public underlingToken: Address
  public lendingPoolName: string
  public symbol: string
  public irm: Address
  public reserveFactor: bigint
  public treasury: Address

  constructor(client: InfinitWallet, params: InitializeLendingPoolTxBuilderParams) {
    super(InitializeLendingPoolTxBuilder.name, client)
    this.lendingPool = getAddress(params.lendingPool)
    this.underlingToken = getAddress(params.underlingToken)
    this.lendingPoolName = params.name
    this.symbol = params.symbol
    this.irm = getAddress(params.irm)
    this.reserveFactor = params.reserveFactor
    this.treasury = getAddress(params.treasury)
  }

  async buildTx(): Promise<TransactionData> {
    const riskManagerArtifact = await readArtifact('LendingPool')
    const functionData = encodeFunctionData({
      abi: riskManagerArtifact.abi,
      functionName: 'initialize',
      args: [this.underlingToken, this.lendingPoolName, this.symbol, this.irm, this.reserveFactor, this.treasury],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.lendingPool,
    }

    return tx
  }

  public async validate(): Promise<void> {
    // check zero address
    if (this.lendingPool === zeroAddress) throw new ValidateInputZeroAddressError('LENDING_POOL')
    if (this.underlingToken === zeroAddress) throw new ValidateInputZeroAddressError('UNDERLING_TOKEN')
    if (this.irm === zeroAddress) throw new ValidateInputZeroAddressError('IRM')
    if (this.treasury === zeroAddress) throw new ValidateInputZeroAddressError('TREASURY')
    // check value
    if (this.reserveFactor < 0n) throw new ValidateInputValueError(`Reserve factor must be greater than 0n, found ${this.reserveFactor}`)
  }
}
