import { Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployInitializableAdminUpgradeabilityProxyParams = {}

export class DeployInitializableAdminUpgradeabilityProxyTxBuilder extends TxBuilder {
  constructor(client: InfinitWallet) {
    super(DeployInitializableAdminUpgradeabilityProxyTxBuilder.name, client)
  }

  async buildTx(): Promise<TransactionData> {
    const initializableAdminUpgradeabilityProxy = await readArtifact('InitializableAdminUpgradeabilityProxy')

    const tx: TransactionData = {
      data: initializableAdminUpgradeabilityProxy.bytecode as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
