import { Address, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

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
  public config: Address
  public pool: Address
  public poolConfig: PoolConfig

  constructor(client: InfinitWallet, params: SetPoolConfigTxBuilderParams) {
    super(SetPoolConfigTxBuilder.name, client)
    this.config = getAddress(params.config)
    this.pool = getAddress(params.pool)
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
    if (this.config === zeroAddress) throw new ValidateInputZeroAddressError('CONFIG')
    if (this.pool === zeroAddress) throw new ValidateInputZeroAddressError('POOL')

    const [configArtifact, acmArtifact] = await Promise.all([readArtifact('Config'), readArtifact('AccessControlManager')])
    const acm: Address = await this.client.publicClient.readContract({
      address: this.config,
      abi: configArtifact.abi,
      functionName: 'ACM',
      args: [],
    })
    const hasRole: boolean = await this.client.publicClient.readContract({
      address: acm,
      abi: acmArtifact.abi,
      functionName: 'hasRole',
      args: [keccak256(toHex('guardian')), this.client.walletClient.account.address],
    })
    if (!hasRole) {
      throw new ContractValidateError('NOT_GUARDIAN')
    }
  }
}