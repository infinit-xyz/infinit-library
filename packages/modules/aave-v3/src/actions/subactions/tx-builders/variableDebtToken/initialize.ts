import { z } from 'zod'

import { Address, Hex, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export const VariableDebtTokenInitializeParamsSchema = z.object({
  variableDebtToken: z.custom<Address>(),
  pool: z.custom<Address>(),
  underlyingAsset: z.custom<Address>(),
  incentivesController: z.custom<Address>(),
  debtTokenDecimals: z.number(),
  debtTokenName: z.string(),
  debtTokenSymbol: z.string(),
  params: z.custom<Hex>(),
})

export type VariableDebtTokenInitializeParams = z.infer<typeof VariableDebtTokenInitializeParamsSchema>

export class VariableDebtTokenInitializeTxBuilder extends TxBuilder {
  private variableDebtToken: Address
  private pool: Address
  private underlyingAsset: Address
  private incentivesController: Address
  private debtTokenDecimals: number
  private debtTokenName: string
  private debtTokenSymbol: string
  private params: Hex

  constructor(client: InfinitWallet, params: VariableDebtTokenInitializeParams) {
    super(VariableDebtTokenInitializeTxBuilder.name, client)
    this.variableDebtToken = getAddress(params.variableDebtToken)
    this.pool = getAddress(params.pool)
    this.underlyingAsset = getAddress(params.underlyingAsset)
    this.incentivesController = getAddress(params.incentivesController)
    this.debtTokenDecimals = params.debtTokenDecimals
    this.debtTokenName = params.debtTokenName
    this.debtTokenSymbol = params.debtTokenSymbol
    this.params = params.params
  }

  async buildTx(): Promise<TransactionData> {
    const variableDebtTokenArtifact = await readArtifact('VariableDebtToken')

    const callData = encodeFunctionData({
      abi: variableDebtTokenArtifact.abi,
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
      to: this.variableDebtToken,
    }
    return tx
  }

  public validate(): any {
    if (this.debtTokenDecimals >= 2 ** 8) throw new ValidateInputValueError('aToken decimals cannot be more than 2^8')
    if (this.variableDebtToken === zeroAddress) throw new ValidateInputZeroAddressError('VARIABLE_DEBT_TOKEN')
  }
}
