import { Address, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type SetACLAdminParams = {
  poolAddressesProvider: Address
  aclAdmin: Address
}

export class SetACLAdminTxBuilder extends TxBuilder {
  private poolAddressesProvider: Address
  private aclAdmin: Address

  constructor(client: InfinitWallet, params: SetACLAdminParams) {
    super(SetACLAdminTxBuilder.name, client)
    this.poolAddressesProvider = params.poolAddressesProvider
    this.aclAdmin = params.aclAdmin
  }

  async buildTx(): Promise<TransactionData> {
    const poolAddressesProviderArtifact = await readArtifact('PoolAddressesProvider')

    const callData = encodeFunctionData({ abi: poolAddressesProviderArtifact.abi, functionName: 'setACLAdmin', args: [this.aclAdmin] })
    const tx: TransactionData = {
      data: callData,
      to: this.poolAddressesProvider,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
