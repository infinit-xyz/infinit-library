import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployApi3ProxyOracleReaderTxBuilderParams {
  accessControlManager: Address
}

export class DeployApi3ProxyOracleReaderTxBuilder extends TxBuilder {
  private accessControlManager: Address

  constructor(client: InfinitWallet, params: DeployApi3ProxyOracleReaderTxBuilderParams) {
    super(DeployApi3ProxyOracleReaderTxBuilder.name, client)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const api3ProxyOracleReaderArtifact = await readArtifact('Api3ProxyOracleReader')

    const deployData: Hex = encodeDeployData({
      abi: api3ProxyOracleReaderArtifact.abi,
      bytecode: api3ProxyOracleReaderArtifact.bytecode,
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
