import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployLsdApi3ProxyOracleReaderTxBuilderParams {
  accessControlManager: Address
}

export class DeployLsdApi3ProxyOracleReaderTxBuilder extends TxBuilder {
  private accessControlManager: Address

  constructor(client: InfinitWallet, params: DeployLsdApi3ProxyOracleReaderTxBuilderParams) {
    super(DeployLsdApi3ProxyOracleReaderTxBuilder.name, client)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const lsdApi3ProxyOracleReaderArtifact = await readArtifact('LsdApi3ProxyOracleReader')

    const deployData: Hex = encodeDeployData({
      abi: lsdApi3ProxyOracleReaderArtifact.abi,
      bytecode: lsdApi3ProxyOracleReaderArtifact.bytecode,
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
