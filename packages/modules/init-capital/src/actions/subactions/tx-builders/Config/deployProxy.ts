import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/subactions/tx-builders/TransparentUpgradeableProxy/deploy'

import { readArtifact } from '@/src/utils/artifact'

export type DeployConfigProxyTxBuilderParams = {
  logic: Address
  admin: Address
}

export class DeployConfigProxyTxBuilder extends TxBuilder {
  private logic: Address
  private admin: Address

  constructor(client: InfinitWallet, params: DeployConfigProxyTxBuilderParams) {
    super(DeployTransparentUpgradeableProxyTxBuilder.name, client)
    this.logic = getAddress(params.logic)
    this.admin = getAddress(params.admin)
  }

  async buildTx(): Promise<TransactionData> {
    const configArtifact = await readArtifact('Config')
    const txData = encodeFunctionData({
      abi: configArtifact.abi,
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
    if (this.logic === zeroAddress) throw new ValidateInputZeroAddressError('LOGIC')
    if (this.admin === zeroAddress) throw new ValidateInputZeroAddressError('ADMIN')
  }
}
