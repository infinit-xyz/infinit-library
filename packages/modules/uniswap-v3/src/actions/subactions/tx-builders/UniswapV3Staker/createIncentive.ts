import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type CreateIncentiveTxBuilderParams = {
  uniswapV3Staker: Address
  incentiveKey: IncentiveKey
  reward: bigint
}

export type IncentiveKey = {
  rewardToken: Address
  pool: Address
  startTime: bigint
  endTime: bigint
  refundee: Address
}

export class CreateIncentiveTxBuilder extends TxBuilder {
  private uniswapV3Staker: Address
  private incentiveKey: IncentiveKey
  private reward: bigint

  constructor(client: InfinitWallet, params: CreateIncentiveTxBuilderParams) {
    super(CreateIncentiveTxBuilder.name, client)
    this.uniswapV3Staker = getAddress(params.uniswapV3Staker)
    const { rewardToken, pool, startTime, endTime, refundee } = params.incentiveKey
    this.incentiveKey = {
      rewardToken: getAddress(rewardToken),
      pool: getAddress(pool),
      startTime: startTime,
      endTime: endTime,
      refundee: getAddress(refundee),
    }
    this.reward = params.reward
  }

  async buildTx(): Promise<TransactionData> {
    const uniswapV3PoolArtifact = await readArtifact('UniswapV3Staker')
    const encodedData = encodeFunctionData({
      abi: uniswapV3PoolArtifact.abi,
      functionName: 'createIncentive',
      args: [this.incentiveKey, this.reward],
    })
    return {
      to: this.uniswapV3Staker,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    if (this.incentiveKey.pool === zeroAddress) throw new ValidateInputValueError('Pool cannot be zero address')
    if (this.incentiveKey.refundee === zeroAddress) throw new ValidateInputValueError('refundee cannot be zero address')
    if (this.incentiveKey.rewardToken === zeroAddress) throw new ValidateInputValueError('rewardToken cannot be zero address')
    if (this.reward === 0n) throw new ValidateInputValueError('reward cannot be zero')
    if (this.incentiveKey.startTime >= this.incentiveKey.endTime) throw new ValidateInputValueError('start time must be before end time')
    // get current block time
    const block = await this.client.publicClient.getBlock()
    if (block.timestamp > this.incentiveKey.startTime) throw new ValidateInputValueError('start time must be now or in the future')
    const uniswapV3StakerArtifact = await readArtifact('UniswapV3Staker')
    // get maxIncentiveStartLeadTime
    const maxIncentiveStartLeadTime = await this.client.publicClient.readContract({
      address: this.uniswapV3Staker,
      abi: uniswapV3StakerArtifact.abi,
      functionName: 'maxIncentiveStartLeadTime',
      args: [],
    })
    if (this.incentiveKey.startTime > block.timestamp + maxIncentiveStartLeadTime)
      throw new ContractValidateError('start time too far into future')
    // get maxIncentiveDuration
    const maxIncentiveDuration = await this.client.publicClient.readContract({
      address: this.uniswapV3Staker,
      abi: uniswapV3StakerArtifact.abi,
      functionName: 'maxIncentiveDuration',
      args: [],
    })
    if (this.incentiveKey.endTime - this.incentiveKey.startTime > maxIncentiveDuration)
      throw new ContractValidateError('incentive duration too long')
    // get reward token balance
    const ierc20Artifact = await readArtifact('@openzeppelin/contracts@3.4.1-solc-0.7-2/token/ERC20/IERC20.sol:IERC20')
    const rewardTokenBalance = await this.client.publicClient.readContract({
      address: this.incentiveKey.rewardToken,
      abi: ierc20Artifact.abi,
      functionName: 'balanceOf',
      args: [this.client.walletClient.account.address],
    })
    if (rewardTokenBalance < this.reward) throw new ContractValidateError('insufficient reward token balance')
    const rewardTokenAllowance = await this.client.publicClient.readContract({
      address: this.incentiveKey.rewardToken,
      abi: ierc20Artifact.abi,
      functionName: 'allowance',
      args: [this.client.walletClient.account.address, this.uniswapV3Staker],
    })
    if (rewardTokenAllowance < this.reward) throw new ContractValidateError('insufficient reward token allowance')
  }
}
