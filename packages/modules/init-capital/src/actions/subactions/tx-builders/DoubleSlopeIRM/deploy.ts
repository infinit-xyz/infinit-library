import { Hex, encodeDeployData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

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
    const doubleSlopeIRMArtifact = await readArtifact('DoubleSlopeIRM')

    const deployData: Hex = encodeDeployData({
      abi: doubleSlopeIRMArtifact.abi,
      bytecode: doubleSlopeIRMArtifact.bytecode as Hex,
      args: [this.baseBorrowRateE18, this.jumpUtilizationRateE18, this.borrowRateMultiplierE18, this.jumpRateMultiplierE18],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.baseBorrowRateE18 < 0n) throw new ValidateInputValueError('baseBorrowRateE18 should not be negative')
    if (this.jumpUtilizationRateE18 < 0n) throw new ValidateInputValueError('jumpUtilizationRateE18 should not be negative')
    if (this.borrowRateMultiplierE18 < 0n) throw new ValidateInputValueError('borrowRateMultiplierE18 should not be negative')
    if (this.jumpRateMultiplierE18 < 0n) throw new ValidateInputValueError('jumpRateMultiplierE18 should not be negative')
  }
}
