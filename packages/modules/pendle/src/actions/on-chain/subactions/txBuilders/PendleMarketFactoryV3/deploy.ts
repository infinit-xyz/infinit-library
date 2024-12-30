import { Address, Hex, encodeDeployData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPendleMarketFactoryV3TxBuilderParams = {
  yieldContractFactory: Address
  marketCreationCodeContractA: Address
  marketCreationCodeSizeA: bigint
  marketCreationCodeContractB: Address
  marketCreationCodeSizeB: bigint
  treasury: Address
  reserveFeePercent: number
  vePendle: Address
  guaugeController: Address
}
export class DeployPendleMarketFactoryV3TxBuilder extends TxBuilder {
  public yieldContractFactory: Address
  public marketCreationCodeContractA: Address
  public marketCreationCodeSizeA: bigint
  public marketCreationCodeContractB: Address
  public marketCreationCodeSizeB: bigint
  public treasury: Address
  public reserveFeePercent: number
  public vePendle: Address
  public guaugeController: Address

  constructor(client: InfinitWallet, params: DeployPendleMarketFactoryV3TxBuilderParams) {
    super(DeployPendleMarketFactoryV3TxBuilder.name, client)

    this.yieldContractFactory = params.yieldContractFactory
    this.marketCreationCodeContractA = params.marketCreationCodeContractA
    this.marketCreationCodeSizeA = params.marketCreationCodeSizeA
    this.marketCreationCodeContractB = params.marketCreationCodeContractB
    this.marketCreationCodeSizeB = params.marketCreationCodeSizeB
    this.treasury = params.treasury
    this.reserveFeePercent = params.reserveFeePercent
    this.vePendle = params.vePendle
    this.guaugeController = params.guaugeController
  }

  async buildTx(): Promise<TransactionData> {
    const PendleMarketFactoryV3Artifact = await readArtifact('PendleMarketFactoryV3')

    const deployData: Hex = encodeDeployData({
      abi: PendleMarketFactoryV3Artifact.abi,
      bytecode: PendleMarketFactoryV3Artifact.bytecode,
      args: [
        this.yieldContractFactory,
        this.marketCreationCodeContractA,
        this.marketCreationCodeSizeA,
        this.marketCreationCodeContractB,
        this.marketCreationCodeSizeB,
        this.treasury,
        this.reserveFeePercent,
        this.vePendle,
        this.guaugeController,
      ],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    const marketContractA = await this.client.publicClient.getCode({ address: this.marketCreationCodeContractA })

    if (!marketContractA) {
      throw new ContractValidateError('marketContractA is not deployed')
    }

    const marketContractB = await this.client.publicClient.getCode({ address: this.marketCreationCodeContractB })

    if (!marketContractB) {
      throw new ContractValidateError('ContractB is not deployed')
    }

    if (this.treasury === zeroAddress) throw new ValidateInputZeroAddressError('TREASURY')

    if (this.reserveFeePercent < 0 || this.reserveFeePercent > 100) {
      throw new Error('reserveFeePercent should be between 0 and 100')
    }
  }
}
