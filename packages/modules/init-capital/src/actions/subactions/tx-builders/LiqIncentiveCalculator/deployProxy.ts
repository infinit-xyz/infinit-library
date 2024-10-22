import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { DeployTransparentUpgradeableProxyTxBuilder } from '@actions/subactions/tx-builders/TransparentUpgradeableProxy/deploy'

import { readArtifact } from '@/src/utils/artifact'

export type DeployLiqIncentiveCalculatorProxyTxBuilderParams = {
  logic: Address
  admin: Address
  maxLiqIncentiveMultiplier: bigint
}

export class DeployLiqIncentiveCalculatorProxyTxBuilder extends TxBuilder {
  private logic: Address
  private admin: Address
  private maxLiqIncentiveMultiplier: bigint

  constructor(client: InfinitWallet, params: DeployLiqIncentiveCalculatorProxyTxBuilderParams) {
    super(DeployTransparentUpgradeableProxyTxBuilder.name, client)
    this.logic = getAddress(params.logic)
    this.admin = getAddress(params.admin)
    this.maxLiqIncentiveMultiplier = params.maxLiqIncentiveMultiplier
  }

  async buildTx(): Promise<TransactionData> {
    const liqIncentiveCalculatorArtifact = await readArtifact('LiqIncentiveCalculator')
    const txData = encodeFunctionData({
      abi: liqIncentiveCalculatorArtifact.abi,
      functionName: 'initialize',
      args: [this.maxLiqIncentiveMultiplier],
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
