import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployAaveOracleParams = {
  poolAddressProvider: Address
  assets: Address[]
  sources: Address[]
  fallbackOracle?: Address
  baseCurrency: Address
  baseCurrencyUnit: bigint
}

export class DeployAaveOracleTxBuilder extends TxBuilder {
  private poolAddressProvider: Address
  private assets: Address[]
  private sources: Address[]
  private fallbackOracle: Address
  private baseCurrency: Address
  private baseCurrencyUnit: bigint

  constructor(client: InfinitWallet, params: DeployAaveOracleParams) {
    super(DeployAaveOracleTxBuilder.name, client)
    this.poolAddressProvider = getAddress(params.poolAddressProvider)
    this.assets = params.assets.map((asset) => getAddress(asset))
    this.sources = params.sources.map((source) => getAddress(source))
    this.fallbackOracle = params.fallbackOracle ?? zeroAddress
    this.baseCurrency = getAddress(params.baseCurrency)
    this.baseCurrencyUnit = params.baseCurrencyUnit
  }

  async buildTx(): Promise<TransactionData> {
    const aaveOracleArtifact = await readArtifact('AaveOracle')

    const deployData: Hex = encodeDeployData({
      abi: aaveOracleArtifact.abi,
      bytecode: aaveOracleArtifact.bytecode as Hex,
      args: [this.poolAddressProvider, this.assets, this.sources, this.fallbackOracle, this.baseCurrency, this.baseCurrencyUnit],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.assets.length != this.sources.length) throw new ValidateInputValueError('assets&sources length mismatched')
  }
}
