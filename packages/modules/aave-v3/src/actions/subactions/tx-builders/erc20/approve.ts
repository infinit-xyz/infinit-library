import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type ApproveTxBuilderParams = {
  token: Address
  spender: Address
  amount: bigint
}

export class ApproveTxBuilder extends TxBuilder {
  private approveParams: ApproveTxBuilderParams

  constructor(client: InfinitWallet, params: ApproveTxBuilderParams) {
    super(ApproveTxBuilder.name, client)
    this.approveParams = { ...params, token: getAddress(params.token), spender: getAddress(params.spender) }
  }

  async buildTx(): Promise<TransactionData> {
    const erc20Artifact = await readArtifact('ERC20')
    const params = this.approveParams

    const args: [Address, bigint] = [params.spender, params.amount]

    const functionData = encodeFunctionData({
      abi: erc20Artifact.abi,
      functionName: 'approve',
      args: args,
    })

    const tx: TransactionData = {
      data: functionData,
      to: params.token,
    }

    return tx
  }

  public async validate(): Promise<void> {
    const params = this.approveParams
    // check zero address
    if (params.spender === zeroAddress) throw new ValidateInputValueError('ASSET_SHOULD_NOT_BE_ZERO_ADDRESS')
  }
}
