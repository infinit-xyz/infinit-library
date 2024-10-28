import { Address, encodeFunctionData, getAddress, maxUint128, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError, ValidateInputZeroAddressError, ValidateLengthError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export interface SetBorrFactorE18TxBuilderParams {
  config: Address
  mode: number
  pools: Address[]
  factors_e18: bigint[]
}

export class SetBorrFactorE18TxBuilder extends TxBuilder {
  private config: Address
  private mode: number
  private pools: Address[]
  private factors_e18: bigint[]

  constructor(client: InfinitWallet, params: SetBorrFactorE18TxBuilderParams) {
    super(SetBorrFactorE18TxBuilder.name, client)
    this.config = getAddress(params.config)
    this.mode = params.mode
    this.pools = params.pools.map((pool) => getAddress(pool))
    this.factors_e18 = params.factors_e18
  }

  async buildTx(): Promise<TransactionData> {
    const configArtifact = await readArtifact('Config')

    const callData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setBorrFactors_e18',
      args: [this.mode, this.pools, this.factors_e18],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.config,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // pools and factors should have the same length
    if (this.pools.length !== this.factors_e18.length) throw new ValidateLengthError()

    // pool should not be zero address
    for (const [index, pool] of this.pools.entries()) {
      if (pool === zeroAddress) throw new ValidateInputZeroAddressError(`POOL (INDEX:${index})`)
    }

    // factor should be with in [0, maxUint128)
    for (const [index, factor] of this.factors_e18.entries()) {
      if (factor < 0n || factor > maxUint128) {
        throw new ValidateInputValueError(`Borrow factor (index: ${index}) is out of range (min: 0n, max: ${maxUint128}), got ${factor}`)
      }
    }
  }
}
