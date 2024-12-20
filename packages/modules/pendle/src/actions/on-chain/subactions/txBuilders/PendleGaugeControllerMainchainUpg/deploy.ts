import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPendleGaugeControllerMainchainUpgTxBuilderParams = {
  votingController: Address
  pendle: Address
  marketFactory: Address
  marketFactory2: Address
  marketFactory3: Address
  marketFactory4: Address
}
export class DeployPendleGaugeControllerMainchainUpgTxBuilder extends TxBuilder {
  public votingController: Address
  public pendle: Address
  public marketFactory: Address
  public marketFactory2: Address
  public marketFactory3: Address
  public marketFactory4: Address

  constructor(client: InfinitWallet, params: DeployPendleGaugeControllerMainchainUpgTxBuilderParams) {
    super(DeployPendleGaugeControllerMainchainUpgTxBuilder.name, client)
    this.votingController = getAddress(params.votingController)
    this.pendle = getAddress(params.pendle)
    this.marketFactory = getAddress(params.marketFactory)
    this.marketFactory2 = getAddress(params.marketFactory2)
    this.marketFactory3 = getAddress(params.marketFactory3)
    this.marketFactory4 = getAddress(params.marketFactory4)
  }

  async buildTx(): Promise<TransactionData> {
    const pendleGaugeControllerMainchainUpgArtifact = await readArtifact('PendleGaugeControllerMainchainUpg')

    const deployData: Hex = encodeDeployData({
      abi: pendleGaugeControllerMainchainUpgArtifact.abi,
      bytecode: pendleGaugeControllerMainchainUpgArtifact.bytecode,
      args: [this.votingController, this.pendle, this.marketFactory, this.marketFactory2, this.marketFactory3, this.marketFactory4],
    })
    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.votingController === zeroAddress) throw new ValidateInputZeroAddressError('VOTING_CONTROLLER')
    if (this.pendle === zeroAddress) throw new ValidateInputZeroAddressError('PENDLE')

    // NOTE: marketFactory can be zero address
  }
}
