import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'
import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/subactions/tx-builders/TransparentUpgradeableProxy/deploy'

export type DeployInitOracleProxyTxBuilderParams = {
  logic: Address
  admin: Address
}

export class DeployInitOracleProxyTxBuilder extends TxBuilder {
  private logic: Address
  private admin: Address

  constructor(client: InfinitWallet, params: DeployInitOracleProxyTxBuilderParams) {
    super(DeployTransparentUpgradeableProxyTxBuilder.name, client)
    this.logic = getAddress(params.logic)
    this.admin = getAddress(params.admin)
  }

  async buildTx(): Promise<TransactionData> {
    const initOracleArtifact = await readArtifact('InitOracle')
    const txData = encodeFunctionData({
      abi: initOracleArtifact.abi,
      functionName: 'initialize',
      args: []
    })

    const txBuilder = new DeployTransparentUpgradeableProxyTxBuilder(this.client, {
        logic: this.logic,
        admin: this.admin,
        data: txData,
    })
    
    return await txBuilder.buildTx()
  }

  public async validate(): Promise<void> {
    if (this.logic === zeroAddress) throw new ValidateInputValueError('Logic cannot be zero address')
    if (this.admin === zeroAddress) throw new ValidateInputValueError('Admin cannot be zero address')
  }
}
