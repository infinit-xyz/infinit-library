import { Address, Hex, encodeDeployData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPythAdapterParams = {
  pyth: Address
  priceId: Hex
}

export class DeployPythAdapterTxBuilder extends TxBuilder {
  private pyth: Address
  private priceId: Hex

  constructor(client: InfinitWallet, params: DeployPythAdapterParams) {
    super(DeployPythAdapterTxBuilder.name, client)
    this.pyth = params.pyth
    this.priceId = params.priceId
  }

  async buildTx(): Promise<TransactionData> {
    const pythAdapterArtifact = await readArtifact('PythAdapter')

    const deployData = encodeDeployData({
      abi: pythAdapterArtifact.abi,
      bytecode: pythAdapterArtifact.bytecode,
      args: [this.pyth, this.priceId],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.pyth === zeroAddress) throw new ValidateInputValueError('PYTH_CANNOT_BE_ZERO_ADDRESS')
    if (this.priceId.length - 2 !== 64) throw new ValidateInputValueError('PRICE_ID_IS_NOT_32_BYTES')
  }
}
