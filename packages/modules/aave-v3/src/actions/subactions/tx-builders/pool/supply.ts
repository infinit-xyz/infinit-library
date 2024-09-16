import type { Address } from 'viem'
import { encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SupplyTxBuilderParams = {
  pool: Address
  asset: Address
  amount: bigint
  onBehalfOf: Address
  referalCode: number
}

export class SupplyTxBuilder extends TxBuilder {
  private supplyParams: SupplyTxBuilderParams

  constructor(client: InfinitWallet, params: SupplyTxBuilderParams) {
    super(SupplyTxBuilder.name, client)
    this.supplyParams = {
      pool: getAddress(params.pool),
      asset: getAddress(params.asset),
      amount: params.amount,
      onBehalfOf: getAddress(params.onBehalfOf),
      referalCode: params.referalCode,
    }
  }

  async buildTx(): Promise<TransactionData> {
    const poolArtifact = await readArtifact('Pool')
    const params = this.supplyParams

    const args: [Address, bigint, Address, number] = [params.asset, params.amount, params.onBehalfOf, params.referalCode]

    const functionData = encodeFunctionData({
      abi: poolArtifact.abi,
      functionName: 'supply',
      args: args,
    })

    const tx: TransactionData = {
      data: functionData,
      to: params.pool,
    }

    return tx
  }

  public async validate(): Promise<void> {
    const erc20Artifact = await readArtifact('ERC20')
    const params = this.supplyParams
    // check if caller has enought fund
    const balance = await this.client.publicClient.readContract({
      address: params.asset,
      abi: erc20Artifact.abi,
      functionName: 'balanceOf',
      args: [this.client.walletClient.account.address],
    })
    if (balance < params.amount) throw new ValidateInputValueError('CALLER_HAS_NOT_ENOUGH_BALANCE')
  }
}
