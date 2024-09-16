import { Address, Hex, encodeDeployData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployAaveEcosystemReserveControllerParams = {
  treasuryOwner: Address
}

export class DeployAaveEcosystemReserveControllerTxBuilder extends TxBuilder {
  private treasuryOwner: Address

  constructor(client: InfinitWallet, params: DeployAaveEcosystemReserveControllerParams) {
    super(DeployAaveEcosystemReserveControllerTxBuilder.name, client)
    this.treasuryOwner = params.treasuryOwner
  }

  async buildTx(): Promise<TransactionData> {
    const aaveEcosystemReserveController = await readArtifact('AaveEcosystemReserveController')

    const deployData = encodeDeployData({
      abi: aaveEcosystemReserveController.abi,
      bytecode: aaveEcosystemReserveController.bytecode as Hex,
      args: [this.treasuryOwner],
    })
    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.treasuryOwner === zeroAddress) throw new ValidateInputValueError('treasuryOwner cannot be zero address')
  }
}
