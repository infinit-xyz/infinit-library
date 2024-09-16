import { Address, Hex, encodeDeployData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployACLManagerParams = {
  poolAddressProvider: Address
}

export class DeployACLManagerTxBuilder extends TxBuilder {
  private poolAddressProvider: Address

  constructor(client: InfinitWallet, params: DeployACLManagerParams) {
    super(DeployACLManagerTxBuilder.name, client)
    this.poolAddressProvider = params.poolAddressProvider
  }

  async buildTx(): Promise<TransactionData> {
    const aclManagerArtifact = await readArtifact('ACLManager')

    const deployData: Hex = encodeDeployData({
      abi: aclManagerArtifact.abi,
      bytecode: aclManagerArtifact.bytecode as Hex,
      args: [this.poolAddressProvider],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
