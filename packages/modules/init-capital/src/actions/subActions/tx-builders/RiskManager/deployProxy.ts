import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/subactions/tx-builders/TransparentUpgradeableProxy/deploy'

import { readArtifact } from '@/src/utils/artifact'

export type DeployRiskManagerProxyTxBuilderParams = {
  logic: Address
  admin: Address
}

export class DeployRiskManagerProxyTxBuilder extends TxBuilder {
  private logic: Address
  private admin: Address

  constructor(client: InfinitWallet, params: DeployRiskManagerProxyTxBuilderParams) {
    super(DeployTransparentUpgradeableProxyTxBuilder.name, client)
    this.logic = getAddress(params.logic)
    this.admin = getAddress(params.admin)
  }

  async buildTx(): Promise<TransactionData> {
    const riskManagerArtifact = await readArtifact('RiskManager')
    const txData = encodeFunctionData({
      abi: riskManagerArtifact.abi,
      functionName: 'initialize',
      args: [],
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
