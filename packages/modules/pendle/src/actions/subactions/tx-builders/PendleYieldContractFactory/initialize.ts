import { Address, Hex, encodeFunctionData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitializePendleYieldContractFactoryTxBuilderParams = {
  pendleYieldContractFactory: Address
  expiryDivisor: bigint
  interestFeeRate: bigint
  rewardFeeRate: bigint
  treausry: Address
}
export class InitializePendleYieldContractFactoryTxBuilder extends TxBuilder {
  public pendleYieldContractFactory: Address
  public expiryDivisor: bigint
  public interestFeeRate: bigint
  public rewardFeeRate: bigint
  public treausry: Address

  constructor(client: InfinitWallet, params: InitializePendleYieldContractFactoryTxBuilderParams) {
    super(InitializePendleYieldContractFactoryTxBuilder.name, client)
    this.pendleYieldContractFactory = params.pendleYieldContractFactory
    this.expiryDivisor = params.expiryDivisor
    this.interestFeeRate = params.interestFeeRate
    this.rewardFeeRate = params.rewardFeeRate
    this.treausry = params.treausry
  }

  async buildTx(): Promise<TransactionData> {
    const pendleYieldContractFactoryArtifact = await readArtifact('PendleYieldContractFactory')

    const deployData: Hex = encodeFunctionData({
      abi: pendleYieldContractFactoryArtifact.abi,
      functionName: 'initialize',
      args: [this.expiryDivisor, this.interestFeeRate, this.rewardFeeRate, this.treausry],
    })

    const tx: TransactionData = {
      data: deployData,
      to: this.pendleYieldContractFactory,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.expiryDivisor <= 0) {
      throw new ValidateInputValueError('ExpiryDivisor must be greater than 0')
    }

    // must be less than 20%
    if (this.interestFeeRate > BigInt(2e17)) {
      throw new ValidateInputValueError('InterestFeeRate must be less than 2e17(20%)')
    }

    // must be less than 20%
    if (this.rewardFeeRate > BigInt(2e17)) {
      throw new ValidateInputValueError('RewardFeeRate must be less than 2e17(20%)')
    }

    if (this.treausry === zeroAddress) {
      throw new ValidateInputZeroAddressError('TREASURY')
    }
  }
}
