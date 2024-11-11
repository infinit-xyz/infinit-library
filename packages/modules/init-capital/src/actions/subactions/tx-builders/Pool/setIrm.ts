import { Address, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetIrmTxBuilderParams = {
  pool: Address
  irm: Address
}

export class SetIrmTxBuilder extends TxBuilder {
  pool: Address
  irm: Address

  constructor(client: InfinitWallet, params: SetIrmTxBuilderParams) {
    super(SetIrmTxBuilder.name, client)
    this.pool = getAddress(params.pool)
    this.irm = getAddress(params.irm)
  }

  async buildTx(): Promise<TransactionData> {
    const poolArtifact = await readArtifact('LendingPool')

    const callData = encodeFunctionData({
      abi: poolArtifact.abi,
      functionName: 'setIrm',
      args: [this.irm],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.pool,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.pool === zeroAddress) {
      throw new ValidateInputZeroAddressError('POOL')
    }

    const [lendingPoolArtifact, acmArtifact] = await Promise.all([readArtifact('LendingPool'), readArtifact('AccessControlManager')])
    const acm = await this.client.publicClient.readContract({
      address: this.pool,
      abi: lendingPoolArtifact.abi,
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
