import { Address, encodeDeployData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployBandAdapterParams = {
  ref: Address
  base: string
  quote: string
}

export class DeployBandAdapterTxBuilder extends TxBuilder {
  private ref: Address
  private base: string
  private quote: string

  constructor(client: InfinitWallet, params: DeployBandAdapterParams) {
    super(DeployBandAdapterTxBuilder.name, client)
    this.ref = params.ref
    this.base = params.base
    this.quote = params.quote
  }

  async buildTx(): Promise<TransactionData> {
    const bandAdapterArtifact = await readArtifact('BandAdapter')

    const deployData = encodeDeployData({
      abi: bandAdapterArtifact.abi,
      bytecode: bandAdapterArtifact.bytecode,
      args: [this.ref, this.base, this.quote],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.ref === zeroAddress) throw new ValidateInputValueError('REF_CANNOT_BE_ZERO_ADDRESS')
    if (this.base === '') throw new ValidateInputValueError('BASE_CANNOT_BE_EMPTY')
    if (this.quote === '') throw new ValidateInputValueError('QUOTE_CANNOT_BE_EMPTY')
  }
}
