import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployInitCoreTxBuilderParams {
  posManager: Address
  accessControlManager: Address
}

export class DeployInitCoreTxBuilder extends TxBuilder {
  private posManager: Address
  private accessControlManager: Address

  constructor(client: InfinitWallet, params: DeployInitCoreTxBuilderParams) {
    super(DeployInitCoreTxBuilder.name, client)
    this.posManager = getAddress(params.posManager)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const initCoreArtifact = await readArtifact('InitCore')

    const deployData: Hex = encodeDeployData({
      abi: initCoreArtifact.abi,
      bytecode: initCoreArtifact.bytecode as Hex,
      args: [this.posManager, this.accessControlManager],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.posManager === zeroAddress) throw new ValidateInputZeroAddressError('POS_MANAGER')
    if (this.accessControlManager === zeroAddress) throw new ValidateInputZeroAddressError('ACCESS_CONTROL_MANAGER')
  }
}
