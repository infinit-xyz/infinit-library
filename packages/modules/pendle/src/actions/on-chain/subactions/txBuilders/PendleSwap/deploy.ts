import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export class DeployPendleSwapTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployPendleSwapTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const pendleSwapArtifact = await readArtifact('PendleSwap')

    const tx: TransactionData = {
      data: pendleSwapArtifact.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    const code = await this.client.publicClient.getCode({ address: '0x2f577A41BeC1BE1152AeEA12e73b7391d15f655D' })

    if (!code) {
      throw new ContractValidateError('PendleSwap contract is not deployed')
    }
  }
}
