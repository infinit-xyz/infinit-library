import { Address, encodeFunctionData, getAddress, keccak256, maxUint64, toHex, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export interface SetMaxHealthAfterLiqE18TxBuilderParams {
  config: Address
  mode: number
  maxHealthAfterLiq_e18: bigint
}

export class SetMaxHealthAfterLiqE18TxBuilder extends TxBuilder {
  public config: Address
  public mode: number
  public maxHealthAfterLiq_e18: bigint

  constructor(client: InfinitWallet, params: SetMaxHealthAfterLiqE18TxBuilderParams) {
    super(SetMaxHealthAfterLiqE18TxBuilder.name, client)
    this.config = getAddress(params.config)
    this.mode = params.mode
    this.maxHealthAfterLiq_e18 = params.maxHealthAfterLiq_e18
  }

  async buildTx(): Promise<TransactionData> {
    const configArtifact = await readArtifact('Config')

    const callData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setMaxHealthAfterLiq_e18',
      args: [this.mode, this.maxHealthAfterLiq_e18],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.config,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // config should not be zero address
    if (this.config === zeroAddress) throw new ValidateInputZeroAddressError('CONFIG')
    // check that maxHealthAfterLiq_e18 is between 0 and maxUint64
    if (this.maxHealthAfterLiq_e18 < 0n || this.maxHealthAfterLiq_e18 > maxUint64) {
      throw new ValidateInputValueError(
        `MaxHealthAfterLiq must be between 0n and ${maxUint64})(maxUint64), found ${this.maxHealthAfterLiq_e18}`,
      )
    }
    // get artifacts
    const [configArtifact, acmArtifact] = await Promise.all([readArtifact('Config'), readArtifact('AccessControlManager')])

    // check role should be guardian
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
