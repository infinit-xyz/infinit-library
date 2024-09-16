import { Address, Hex, encodeDeployData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployDelegationAwareATokenParams = {
  pool: Address
}

export class DeployDelegationAwareATokenTxBuilder extends TxBuilder {
  private pool: Address

  constructor(client: InfinitWallet, params: DeployDelegationAwareATokenParams) {
    super(DeployDelegationAwareATokenTxBuilder.name, client)
    this.pool = params.pool
  }

  async buildTx(): Promise<TransactionData> {
    const delegationAwareATokenArtifact = await readArtifact('DelegationAwareAToken')

    const deployData: Hex = encodeDeployData({
      abi: delegationAwareATokenArtifact.abi,
      bytecode: delegationAwareATokenArtifact.bytecode as Hex,
      args: [this.pool],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public validate(): any {}
}
