import { z } from 'zod'

import { Address, Hex, encodeFunctionData } from 'viem'

import { InfinitCallback, InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export const ATokenInitializeParamsSchema = z.object({
  aToken: z.custom<Address>(),
  pool: z.custom<Address>(),
  treasury: z.custom<Address>(),
  underlyingAsset: z.custom<Address>(),
  incentivesController: z.custom<Address>(),
  aTokenDecimals: z.number(),
  aTokenName: z.string(),
  aTokenSymbol: z.string(),
  params: z.custom<Hex>(),
})

export const BaseATokenInitializeParamsSchema = z.object({
  underlyingAsset: z.custom<Address>(),
  incentivesController: z.custom<Address>(),
  aTokenDecimals: z.number(),
  aTokenName: z.string(),
  aTokenSymbol: z.string(),
  params: z.custom<Hex>(),
})

export type ATokenInitializeParams = z.infer<typeof ATokenInitializeParamsSchema>

export type BaseATokenInitializeParams = z.infer<typeof BaseATokenInitializeParamsSchema>

export class ATokenInitializeTxBuilder extends TxBuilder {
  private aToken: Address
  private pool: Address
  private treasury: Address
  private underlyingAsset: Address
  private incentivesController: Address
  private aTokenDecimals: number
  private aTokenName: string
  private aTokenSymbol: string
  private params: Hex

  constructor(client: InfinitWallet, params: ATokenInitializeParams) {
    super(ATokenInitializeTxBuilder.name, client)
    this.aToken = params.aToken
    this.pool = params.pool
    this.treasury = params.treasury
    this.underlyingAsset = params.underlyingAsset
    this.incentivesController = params.incentivesController
    this.aTokenDecimals = params.aTokenDecimals
    this.aTokenName = params.aTokenName
    this.aTokenSymbol = params.aTokenSymbol
    this.params = params.params
  }

  async buildTx(_callback: InfinitCallback): Promise<TransactionData> {
    const aTokenArtifact = await readArtifact('AToken')

    const callData = encodeFunctionData({
      abi: aTokenArtifact.abi,
      functionName: 'initialize',
      args: [
        this.pool,
        this.treasury,
        this.underlyingAsset,
        this.incentivesController,
        this.aTokenDecimals,
        this.aTokenName,
        this.aTokenSymbol,
        this.params,
      ],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.aToken,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.aTokenDecimals >= 2 ** 8) throw new ValidateInputValueError('aToken decimals cannot be more than 2^8')
  }
}
