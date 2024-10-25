import { Address, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetOracleTxBuilderParams = {
  initCore: Address
  oracle: Address
}

export class SetOracleTxBuilder extends TxBuilder {
  public initCore: Address
  public oracle: Address

  constructor(client: InfinitWallet, params: SetOracleTxBuilderParams) {
    super(SetOracleTxBuilder.name, client)
    this.initCore = getAddress(params.initCore)
    this.oracle = getAddress(params.oracle)
  }

  async buildTx(): Promise<TransactionData> {
    const initCoreArtifact = await readArtifact('InitCore')

    const functionData = encodeFunctionData({
      abi: initCoreArtifact.abi,
      functionName: 'setOracle',
      args: [this.oracle],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.initCore,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.initCore === zeroAddress) {
      throw new ValidateInputZeroAddressError('INIT_CORE')
    }

    const [initCoreArtifact, acmArtifact] = await Promise.all([readArtifact('InitCore'), readArtifact('AccessControlManager')])
    const acm: Address = await this.client.publicClient.readContract({
      address: this.initCore,
      abi: initCoreArtifact.abi,
      functionName: 'ACM',
      args: [],
    })

    const hasRole: boolean = await this.client.publicClient.readContract({
      address: acm,
      abi: acmArtifact.abi,
      functionName: 'hasRole',
      args: [keccak256(toHex('governor')), this.client.walletClient.account.address],
    })
    if (!hasRole) {
      throw new ContractValidateError('NOT_GOVERNOR')
    }
  }
}
