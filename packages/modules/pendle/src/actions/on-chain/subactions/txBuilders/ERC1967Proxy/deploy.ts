import { Address, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployERC1967ProxyTxBuilderParams = {
  implementation: Address
  data?: Address
  value?: bigint
}

export class DeployERC1967ProxyTxBuilder extends TxBuilder {
  implementation: Address
  data: Address
  value: bigint

  constructor(client: InfinitWallet, params: DeployERC1967ProxyTxBuilderParams) {
    super(DeployERC1967ProxyTxBuilder.name, client)

    this.implementation = getAddress(params.implementation)
    this.data = params.data ?? '0x'
    this.value = params.value ?? 0n
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
      value: this.value,
    }
  }

  public async validate(): Promise<void> {
    // check zero address
    if (this.implementation === zeroAddress) throw new ValidateInputZeroAddressError('PENDLE_GOVERNANCE_PROXY_IMPLEMENTATION')

    // check implementation should has bytecode
    const bytecode = await this.client.publicClient.getCode({
      address: this.implementation,
    })
    if (bytecode === undefined) throw new ValidateInputValueError('Implementation should have bytecode')
  }
}
