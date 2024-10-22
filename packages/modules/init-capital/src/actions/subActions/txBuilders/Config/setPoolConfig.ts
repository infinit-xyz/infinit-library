import { Address, encodeFunctionData, keccak256, toHex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type PoolConfig = {
  supplyCap: bigint
  borrowCap: bigint
  canMint: boolean
  canBurn: boolean
  canBorrow: boolean
  canRepay: boolean
  canFlash: boolean
}
export type SetPoolConfigTxBuilderParams = {
  config: Address
  pool: Address
  poolConfig: PoolConfig
}

export class SetPoolConfigTxBuilder extends TxBuilder {
  config: Address
  pool: Address
  poolConfig: PoolConfig

  constructor(client: InfinitWallet, params: SetPoolConfigTxBuilderParams) {
    super(SetPoolConfigTxBuilder.name, client)
    this.config = params.config
    this.pool = params.pool
    this.poolConfig = params.poolConfig
  }

  async buildTx(): Promise<TransactionData> {
    const configArtifact = await readArtifact('Config')

    const callData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setPoolConfig',
      args: [this.pool, this.poolConfig],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.config,
    }
    return tx
  }

  public async validate(): Promise<void> {
    const acmArtifact = await readArtifact('AccessControlManager')
    const hasRole: boolean = await this.client.publicClient.readContract({
      address: this.config,
      abi: acmArtifact.abi,
      functionName: 'hasRole',
      args: [keccak256(toHex('guardian')), this.client.walletClient.account.address],
    })
    if (!hasRole) {
      throw new ContractValidateError('NOT_GUARDIAN')
    }
  }
}
