import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployPythOracleReaderTxBuilderParams {
  accessControlManager: Address
}

export class DeployPythOracleReaderTxBuilder extends TxBuilder {
  private accessControlManager: Address

  constructor(client: InfinitWallet, params: DeployPythOracleReaderTxBuilderParams) {
    super(DeployPythOracleReaderTxBuilder.name, client)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const pythOracleReaderArtifact = await readArtifact('PythOracleReader')

    const deployData: Hex = encodeDeployData({
      abi: pythOracleReaderArtifact.abi,
      bytecode: pythOracleReaderArtifact.bytecode as Hex,
      args: [this.accessControlManager],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.accessControlManager === zeroAddress) throw new ValidateInputZeroAddressError('ACCESS_CONTROL_MANAGER')
  }
}
