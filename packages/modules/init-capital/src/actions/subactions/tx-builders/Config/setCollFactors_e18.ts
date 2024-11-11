import { Address, encodeFunctionData, getAddress, keccak256, parseUnits, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import {
  ContractValidateError,
  ValidateInputValueError,
  ValidateInputZeroAddressError,
  ValidateLengthError,
} from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export interface SetCollFactorE18TxBuilderParams {
  config: Address
  mode: number
  pools: Address[]
  factors_e18: bigint[]
}

export class SetCollFactorE18TxBuilder extends TxBuilder {
  public config: Address
  public mode: number
  public pools: Address[]
  public factors_e18: bigint[]

  constructor(client: InfinitWallet, params: SetCollFactorE18TxBuilderParams) {
    super(SetCollFactorE18TxBuilder.name, client)
    this.config = getAddress(params.config)
    this.mode = params.mode
    this.pools = params.pools.map((pool) => getAddress(pool))
    this.factors_e18 = params.factors_e18
  }

  async buildTx(): Promise<TransactionData> {
    const configArtifact = await readArtifact('Config')

    const callData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setCollFactors_e18',
      args: [this.mode, this.pools, this.factors_e18],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.config,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // config should not be zero address
    if (this.config === zeroAddress) throw new ValidateInputZeroAddressError('CONFIG')
    // pools and factors should have the same length
    if (this.pools.length !== this.factors_e18.length) throw new ValidateLengthError()

    // pool should not be zero address
    for (const [index, pool] of this.pools.entries()) {
      if (pool === zeroAddress) throw new ValidateInputZeroAddressError(`POOL (INDEX:${index})`)
    }

    // factor should be with in [0, 1e18]
    for (const [index, factor] of this.factors_e18.entries()) {
      const oneE18 = parseUnits('1', 18)
      if (factor < 0n || factor > oneE18) {
        throw new ValidateInputValueError(`Collateral factor (index: ${index}) is out of range (min: 0n, max: ${oneE18}n), got ${factor}n`)
      }
    }

    // get artifacts
    const [configArtifact, acmArtifact] = await Promise.all([readArtifact('Config'), readArtifact('AccessControlManager')])

    // check role should be governor
    const acm: Address = await this.client.publicClient.readContract({
      address: this.config,
      abi: configArtifact.abi,
      functionName: 'ACM',
      args: [],
    })
    const hasRole: boolean = await this.client.publicClient.readContract({
      address: acm,
      abi: acmArtifact.abi,
      functionName: 'hasRole',
      args: [keccak256(toHex('governor')), this.client.walletClient.account.address],
    })
    if (!hasRole) {
      throw new ContractValidateError('NOT_GOVERNOR')
    }
  }
}
