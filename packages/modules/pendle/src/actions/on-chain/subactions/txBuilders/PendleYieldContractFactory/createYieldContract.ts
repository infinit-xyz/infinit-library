import { Address, encodeFunctionData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type CreateYieldContractTxBuilderParams = {
  pendleYieldContractFactory: Address
  sy: Address
  expiry: number
  doCacheIndexSameBlock: boolean
}
export class CreateYieldContractTxBuilder extends TxBuilder {
  public pendleYieldContractFactory: Address
  public sy: Address
  public expiry: number
  public doCacheIndexSameBlock: boolean

  constructor(client: InfinitWallet, params: CreateYieldContractTxBuilderParams) {
    super(CreateYieldContractTxBuilder.name, client)

    this.pendleYieldContractFactory = params.pendleYieldContractFactory
    this.sy = params.sy
    this.expiry = params.expiry
    this.doCacheIndexSameBlock = params.doCacheIndexSameBlock
  }

  async buildTx(): Promise<TransactionData> {
    const pendleYieldContractFactoryArtifact = await readArtifact('PendleYieldContractFactory')

    const callData = encodeFunctionData({
      abi: pendleYieldContractFactoryArtifact.abi,
      functionName: 'createYieldContract',
      args: [this.sy, this.expiry, this.doCacheIndexSameBlock],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.pendleYieldContractFactory,
    }
    return tx
  }

  public async validate(): Promise<void> {
    const [block, pendleYieldContractFactoryArtifact] = await Promise.all([
      this.client.publicClient.getBlock(),
      readArtifact('PendleYieldContractFactory'),
    ])

    if (this.expiry <= 0 && this.expiry > block.timestamp) {
      throw new ValidateInputValueError('invalid expiry time')
    }
    const pt = await this.client.publicClient.readContract({
      address: this.pendleYieldContractFactory,
      abi: pendleYieldContractFactoryArtifact.abi,
      functionName: 'getPT',
      args: [this.sy, BigInt(this.expiry)],
    })
    if (pt === zeroAddress) {
      throw new ValidateInputZeroAddressError('PT')
    }
  }
}
