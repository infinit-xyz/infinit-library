import { z } from 'zod'

import { Address, Hex, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export const StableDebtTokenInitializeParamsSchema = z.object({
  stableDebtToken: z.custom<Address>(),
  pool: z.custom<Address>(),
  underlyingAsset: z.custom<Address>(),
  incentivesController: z.custom<Address>(),
  debtTokenDecimals: z.number(),
  debtTokenName: z.string(),
  debtTokenSymbol: z.string(),
  params: z.custom<Hex>(),
})

export type StableDebtTokenInitializeParams = z.infer<typeof StableDebtTokenInitializeParamsSchema>

export class StableDebtTokenInitializeTxBuilder extends TxBuilder {
  private stableDebtToken: Address
  private pool: Address
  private underlyingAsset: Address
  private incentivesController: Address
  private debtTokenDecimals: number
  private debtTokenName: string
  private debtTokenSymbol: string
  private params: Hex

  constructor(client: InfinitWallet, params: StableDebtTokenInitializeParams) {
    super(StableDebtTokenInitializeTxBuilder.name, client)
    this.stableDebtToken = getAddress(params.stableDebtToken)
    this.pool = getAddress(params.pool)
    this.underlyingAsset = getAddress(params.underlyingAsset)
    this.incentivesController = getAddress(params.incentivesController)
    this.debtTokenDecimals = params.debtTokenDecimals
    this.debtTokenName = params.debtTokenName
    this.debtTokenSymbol = params.debtTokenSymbol
    this.params = params.params
  }

  async buildTx(): Promise<TransactionData> {
    const stableDebtTokenArtifact = await readArtifact('StableDebtToken')

    const callData = encodeFunctionData({
      abi: stableDebtTokenArtifact.abi,
      functionName: 'initialize',
      args: [
        this.pool,
        this.underlyingAsset,
        this.incentivesController,
        this.debtTokenDecimals,
        this.debtTokenName,
        this.debtTokenSymbol,
        this.params,
      ],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.stableDebtToken,
    }
    return tx
  }

  public validate(): any {
    if (this.stableDebtToken === zeroAddress) throw new ValidateInputZeroAddressError('STABLE_DEBT_TOKEN')
  }
}
