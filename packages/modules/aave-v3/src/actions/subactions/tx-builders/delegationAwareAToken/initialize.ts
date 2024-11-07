import { z } from 'zod'

import { Address, Hex, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export const DelegationAwareATokenInitializeParamsSchema = z.object({
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

export type DelegationAwareATokenInitializeParams = z.infer<typeof DelegationAwareATokenInitializeParamsSchema>

export class DelegationAwareATokenInitializeTxBuilder extends TxBuilder {
  private aToken: Address
  private pool: Address
  private treasury: Address
  private underlyingAsset: Address
  private incentivesController: Address
  private aTokenDecimals: number
  private aTokenName: string
  private aTokenSymbol: string
  private params: Hex

  constructor(client: InfinitWallet, params: DelegationAwareATokenInitializeParams) {
    super(DelegationAwareATokenInitializeTxBuilder.name, client)
    this.aToken = getAddress(params.aToken)
    this.pool = getAddress(params.pool)
    this.treasury = getAddress(params.treasury)
    this.underlyingAsset = getAddress(params.underlyingAsset)
    this.incentivesController = getAddress(params.incentivesController)
    this.aTokenDecimals = params.aTokenDecimals
    this.aTokenName = params.aTokenName
    this.aTokenSymbol = params.aTokenSymbol
    this.params = params.params
  }

  async buildTx(): Promise<TransactionData> {
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

  public validate(): any {
    if (this.aTokenDecimals >= 2 ** 8) throw new ValidateInputValueError('aToken decimals cannot be more than 2^8')
  }
}
