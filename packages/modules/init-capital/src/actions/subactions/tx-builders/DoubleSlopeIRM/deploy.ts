import { Hex, encodeDeployData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployDoubleSlopeIRMTxBuilderParams {
  baseBorrowRateE18: bigint
  jumpUtilizationRateE18: bigint
  borrowRateMultiplierE18: bigint
  jumpRateMultiplierE18: bigint
}

export class DeployDoubleSlopeIRMTxBuilder extends TxBuilder {
  baseBorrowRateE18: bigint
  jumpUtilizationRateE18: bigint
  borrowRateMultiplierE18: bigint
  jumpRateMultiplierE18: bigint

  constructor(client: InfinitWallet, params: DeployDoubleSlopeIRMTxBuilderParams) {
    super(DeployDoubleSlopeIRMTxBuilder.name, client)
    this.baseBorrowRateE18 = params.baseBorrowRateE18
    this.jumpUtilizationRateE18 = params.jumpUtilizationRateE18
    this.borrowRateMultiplierE18 = params.borrowRateMultiplierE18
    this.jumpRateMultiplierE18 = params.jumpRateMultiplierE18
  }

  async buildTx(): Promise<TransactionData> {
    const liqIncentiveCalculatorArtifact = await readArtifact('DoubleSlopeIRM')

    const deployData: Hex = encodeDeployData({
      abi: liqIncentiveCalculatorArtifact.abi,
      bytecode: liqIncentiveCalculatorArtifact.bytecode as Hex,
      args: [this.baseBorrowRateE18, this.jumpUtilizationRateE18, this.borrowRateMultiplierE18, this.jumpRateMultiplierE18],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
