import { Address, encodeFunctionData, getAddress, keccak256, toHex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError, ValidateLengthError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetMaxPriceDeviations_e18TxBuilderParams = {
  initOracle: Address
  tokens: Address[]
  maxPriceDeviations_e18s: bigint[]
}

export class SetMaxPriceDeviations_e18TxBuilder extends TxBuilder {
  public initOracle: Address
  public tokens: Address[]
  public maxPriceDeviations_e18s: bigint[]

  constructor(client: InfinitWallet, params: SetMaxPriceDeviations_e18TxBuilderParams) {
    super(SetMaxPriceDeviations_e18TxBuilder.name, client)
    this.initOracle = getAddress(params.initOracle)
    this.tokens = params.tokens.map((token) => getAddress(token))
    this.maxPriceDeviations_e18s = params.maxPriceDeviations_e18s
  }

  async buildTx(): Promise<TransactionData> {
    const initOracleArtifact = await readArtifact('InitOracle')

    const callData = encodeFunctionData({
      abi: initOracleArtifact.abi,
      functionName: 'setMaxPriceDeviations_e18',
      args: [this.tokens, this.maxPriceDeviations_e18s],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.initOracle,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.tokens.length !== this.maxPriceDeviations_e18s.length) {
      throw new ValidateLengthError()
    }
    this.maxPriceDeviations_e18s.forEach((maxPriceDeviations_e18) => {
      if (maxPriceDeviations_e18 < 10n ** 18n) {
        throw new ValidateInputValueError('INVALID_MAX_PRICE_DEVIATIONS')
      }
    })
    const [initOracleArtifact, acmArtifact] = await Promise.all([readArtifact('Config'), readArtifact('AccessControlManager')])
    const acm: Address = await this.client.publicClient.readContract({
      address: this.initOracle,
      abi: initOracleArtifact.abi,
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
