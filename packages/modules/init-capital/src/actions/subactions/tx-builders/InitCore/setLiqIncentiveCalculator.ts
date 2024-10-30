import { Address, encodeFunctionData, getAddress, keccak256, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetLiqIncentiveCalculatorTxBuilderParams = {
  initCore: Address
  liqIncentiveCalculator: Address
}

export class SetLiqIncentiveCalculatorTxBuilder extends TxBuilder {
  public initCore: Address
  public liqIncentiveCalculator: Address

  constructor(client: InfinitWallet, params: SetLiqIncentiveCalculatorTxBuilderParams) {
    super(SetLiqIncentiveCalculatorTxBuilder.name, client)
    this.initCore = getAddress(params.initCore)
    this.liqIncentiveCalculator = getAddress(params.liqIncentiveCalculator)
  }

  async buildTx(): Promise<TransactionData> {
    const configArtifact = await readArtifact('InitCore')

    const callData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setLiqIncentiveCalculator',
      args: [this.liqIncentiveCalculator],
    })
    const tx: TransactionData = {
      data: callData,
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
      args: [keccak256(toHex('guardian')), this.client.walletClient.account.address],
    })
    if (!hasRole) {
      throw new ContractValidateError('NOT_GUARDIAN')
    }
  }
}
