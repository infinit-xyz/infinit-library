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
  private params: InitializeLendingPoolTxBuilderParams

  constructor(client: InfinitWallet, params: InitializeLendingPoolTxBuilderParams) {
    super(InitializeLendingPoolTxBuilder.name, client)
    this.params = {
      lendingPool: getAddress(params.lendingPool),
      underlingToken: getAddress(params.underlingToken),
      name: params.name,
      symbol: params.symbol,
      irm: getAddress(params.irm),
      reserveFactor: params.reserveFactor,
      treasury: getAddress(params.treasury),
    }
  }

  async buildTx(): Promise<TransactionData> {
    const riskManagerArtifact = await readArtifact('LendingPool')
    const functionData = encodeFunctionData({
      abi: riskManagerArtifact.abi,
      functionName: 'initialize',
      args: [
        this.params.underlingToken,
        this.params.name,
        this.params.symbol,
        this.params.irm,
        this.params.reserveFactor,
        this.params.treasury,
      ],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.params.lendingPool,
    }

    return tx
  }

  public async validate(): Promise<void> {
    // check zero address
    if (this.params.lendingPool === zeroAddress) throw new ValidateInputZeroAddressError('LENDING_POOL')
    if (this.params.underlingToken === zeroAddress) throw new ValidateInputZeroAddressError('UNDERLING_TOKEN')
    if (this.params.irm === zeroAddress) throw new ValidateInputZeroAddressError('IRM')
    if (this.params.treasury === zeroAddress) throw new ValidateInputZeroAddressError('TREASURY')
    // check value
    if (this.params.reserveFactor < 0n)
      throw new ValidateInputValueError(`Reserve factor must be greater than 0n, found ${this.params.reserveFactor}`)
  }
}
