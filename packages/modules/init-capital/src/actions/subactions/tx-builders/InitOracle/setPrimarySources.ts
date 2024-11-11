import { Address, encodeFunctionData, getAddress, keccak256, toHex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateLengthError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type SetPrimarySourcesParams = {
  initOracle: Address
  tokens: Address[]
  sources: Address[]
}

export class SetPrimarySourcesTxBuilder extends TxBuilder {
  public initOracle: Address
  public tokens: Address[]
  public sources: Address[]

  constructor(client: InfinitWallet, params: SetPrimarySourcesParams) {
    super(SetPrimarySourcesTxBuilder.name, client)
    this.initOracle = getAddress(params.initOracle)
    this.tokens = params.tokens.map((token) => getAddress(token))
    this.sources = params.sources
  }

  async buildTx(): Promise<TransactionData> {
    const initOracleArtifact = await readArtifact('InitOracle')

    // console.log('tokens', this.tokens)
    // console.log('sources', this.sources)
    // console.log('oracle', this.initOracle)
    const callData = encodeFunctionData({
      abi: initOracleArtifact.abi,
      functionName: 'setPrimarySources',
      args: [this.tokens, this.sources],
    })
    const tx: TransactionData = {
      data: callData,
      to: this.initOracle,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // check length
    if (this.tokens.length !== this.sources.length) {
      throw new ValidateLengthError()
    }
    // check role
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
