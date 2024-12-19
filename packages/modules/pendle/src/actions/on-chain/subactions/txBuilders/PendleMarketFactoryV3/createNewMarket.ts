import { Address, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type CreateNewMarketTxBuilderParams = {
  pendleMarketFactoryV3: Address
  PT: Address
  scalarRoot: bigint
  initialAnchor: bigint
  lnFeeRateRoot: bigint
}
export class CreateNewMarketTxBuilder extends TxBuilder {
  public pendleMarketFactoryV3: Address
  public PT: Address
  public scalarRoot: bigint
  public initialAnchor: bigint
  public lnFeeRateRoot: bigint

  constructor(client: InfinitWallet, params: CreateNewMarketTxBuilderParams) {
    super(CreateNewMarketTxBuilder.name, client)

    this.pendleMarketFactoryV3 = params.pendleMarketFactoryV3
    this.PT = params.PT
    this.scalarRoot = params.scalarRoot
    this.initialAnchor = params.initialAnchor
    this.lnFeeRateRoot = params.lnFeeRateRoot
  }

  async buildTx(): Promise<TransactionData> {
    const pendleYieldContractFactoryArtifact = await readArtifact('PendleMarketFactoryV3')

    const callData = encodeFunctionData({
      abi: pendleYieldContractFactoryArtifact.abi,
      functionName: 'createNewMarket',
      args: [this.PT, this.scalarRoot, this.initialAnchor, this.lnFeeRateRoot],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.pendleMarketFactoryV3,
    }
    return tx
  }

  public async validate(): Promise<void> {
    const [pendleYieldContractFactoryArtifact, ptArtifact, pendleMarketArtifact] = await Promise.all([
      readArtifact('IPYieldContractFactory'),
      readArtifact('IPPrincipalToken'),
      readArtifact('PendleMarketFactoryV3'),
    ])

    const yieldContractFactory = await this.client.publicClient.readContract({
      address: this.pendleMarketFactoryV3,
      abi: pendleMarketArtifact.abi,
      functionName: 'yieldContractFactory',
      args: [],
    })

    const isPT = await this.client.publicClient.readContract({
      address: yieldContractFactory,
      abi: pendleYieldContractFactoryArtifact.abi,
      functionName: 'isPT',
      args: [this.PT],
    })

    if (!isPT) {
      throw new ValidateInputValueError('not a valid PT')
    }

    const isExpired = await this.client.publicClient.readContract({
      address: this.PT,
      abi: ptArtifact.abi,
      functionName: 'isExpired',
      args: [],
    })
    if (isExpired) {
      throw new ValidateInputValueError('PT is not expired')
    }

    const maxLnFeeRateRoot = await this.client.publicClient.readContract({
      address: this.pendleMarketFactoryV3,
      abi: pendleMarketArtifact.abi,
      functionName: 'maxLnFeeRateRoot',
      args: [],
    })

    if (this.lnFeeRateRoot > maxLnFeeRateRoot) {
      throw new ValidateInputValueError('lnFeeRateRoot is too high')
    }

    if (this.initialAnchor < 1e18) {
      throw new ValidateInputValueError('initialAnchor is too low')
    }
  }
}
