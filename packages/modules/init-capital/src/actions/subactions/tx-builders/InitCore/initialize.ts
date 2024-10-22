import { Address, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type InitializeInitCoreTxBuilderParams = {
  initCore: Address
  config: Address
  initOracle: Address
  liqIncentiveCalculator: Address
  riskManager: Address
}

export class InitializeInitCoreTxBuilder extends TxBuilder {
  private initCore: Address
  private config: Address
  private initOracle: Address
  private liqIncentiveCalculator: Address
  private riskManager: Address

  constructor(client: InfinitWallet, params: InitializeInitCoreTxBuilderParams) {
    super(InitializeInitCoreTxBuilder.name, client)
    this.initCore = getAddress(params.initCore)
    this.config = getAddress(params.config)
    this.initOracle = getAddress(params.initOracle)
    this.liqIncentiveCalculator = getAddress(params.liqIncentiveCalculator)
    this.riskManager = getAddress(params.riskManager)
  }

  async buildTx(): Promise<TransactionData> {
    const initCoreArtifact = await readArtifact('InitCore')

    const functionData = encodeFunctionData({
      abi: initCoreArtifact.abi,
      functionName: 'initialize',
      args: [this.config, this.initOracle, this.liqIncentiveCalculator, this.riskManager],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.initCore,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
