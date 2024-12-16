import { Address, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployERC1967ProxyTxBuilderParams = {
  implementation: Address
  data?: Address
}

export class DeployERC1967ProxyTxBuilder extends TxBuilder {
  implementation: Address
  data: Address

  constructor(client: InfinitWallet, params: DeployERC1967ProxyTxBuilderParams) {
    super(DeployERC1967ProxyTxBuilder.name, client)

    this.implementation = getAddress(params.implementation)
    this.data = params.data ?? '0x'
  }

  async buildTx(): Promise<TransactionData> {
    const erc1967 = await readArtifact('ERC1967Proxy')

    const encodedData = encodeDeployData({
      abi: erc1967.abi,
      bytecode: erc1967.bytecode,
      args: [this.implementation, this.data],
    })

    return {
      to: null,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {}
}
