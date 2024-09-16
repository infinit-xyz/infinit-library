import type { Address, Hex } from 'viem'
import { encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type InitReserveInput = {
  aTokenImpl: Address
  stableDebtTokenImpl: Address
  variableDebtTokenImpl: Address
  underlyingAssetDecimals: number
  interestRateStrategyAddress: Address
  underlyingAsset: Address
  treasury: Address
  incentivesController: Address
  aTokenName: string
  aTokenSymbol: string
  variableDebtTokenName: string
  variableDebtTokenSymbol: string
  stableDebtTokenName: string
  stableDebtTokenSymbol: string
  params: Hex
}

export type InitReserveTxBuilderParams = {
  poolConfigurator: Address
  pool: Address
  inputs: InitReserveInput[]
}

export class InitReserveTxBuilder extends TxBuilder {
  private inputs: InitReserveInput[]
  private poolConfigurator: Address
  private pool: Address

  constructor(client: InfinitWallet, params: InitReserveTxBuilderParams) {
    super(InitReserveTxBuilder.name, client)

    this.inputs = params.inputs.map(
      ({
        aTokenImpl,
        stableDebtTokenImpl,
        variableDebtTokenImpl,
        interestRateStrategyAddress,
        underlyingAsset,
        treasury,
        incentivesController,
        ...rest
      }) => {
        return {
          aTokenImpl: getAddress(aTokenImpl),
          stableDebtTokenImpl: getAddress(stableDebtTokenImpl),
          variableDebtTokenImpl: getAddress(variableDebtTokenImpl),
          interestRateStrategyAddress: getAddress(interestRateStrategyAddress),
          underlyingAsset: getAddress(underlyingAsset),
          treasury: getAddress(treasury),
          incentivesController: getAddress(incentivesController),
          ...rest,
        }
      },
    )
    this.poolConfigurator = getAddress(params.poolConfigurator)
    this.pool = getAddress(params.pool)
  }

  async buildTx(): Promise<TransactionData> {
    // contract action
    const readonlyParams = Object.freeze(this.inputs)
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')

    const encodedData = encodeFunctionData({
      abi: poolConfiguratorArtifact.abi,
      functionName: 'initReserves',
      args: [readonlyParams],
    })
    return {
      to: this.poolConfigurator,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    const publicClient = this.client.publicClient
    const poolArtifact = await readArtifact('Pool')
    const reserves = await publicClient.readContract({
      address: this.pool,
      abi: poolArtifact.abi,
      functionName: 'getReservesList',
      args: [],
    })
    if (reserves.length + this.inputs.length > 128) throw new ValidateInputValueError('NO_MORE_RESERVES_ALLOWED')
    for (const input of this.inputs) {
      const reserveData = await publicClient.readContract({
        address: this.pool,
        abi: poolArtifact.abi,
        functionName: 'getReserveData',
        args: [input.underlyingAsset],
      })
      const reserveAlreadyAdded = reserveData.id !== 0 || reserves[0] === input.underlyingAsset
      if (reserveAlreadyAdded) {
        throw new ValidateInputValueError('RESERVE_ALREADY_ADDED')
      }
    }
  }
}
