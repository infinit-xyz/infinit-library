import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployInitLensTxBuilderParams {
  initCore: Address
  posManager: Address
  riskManager: Address
  config: Address
}

export class DeployInitLensTxBuilder extends TxBuilder {
  private initCore: Address
  private posManager: Address
  private riskManager: Address
  private config: Address

  constructor(client: InfinitWallet, params: DeployInitLensTxBuilderParams) {
    super(DeployInitLensTxBuilder.name, client)
    this.initCore = getAddress(params.initCore)
    this.posManager = getAddress(params.posManager)
    this.riskManager = getAddress(params.riskManager)
    this.config = getAddress(params.config)
  }

  async buildTx(): Promise<TransactionData> {
    const initLensArtifact = await readArtifact('InitLens')

    const deployData: Hex = encodeDeployData({
      abi: initLensArtifact.abi,
      bytecode: initLensArtifact.bytecode as Hex,
      args: [this.initCore, this.posManager, this.riskManager, this.config],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.initCore === zeroAddress) throw new ValidateInputZeroAddressError('INIT_ORACLE_CANNOT_BE_ZERO_ADDRESS')
    if (this.posManager === zeroAddress) throw new ValidateInputZeroAddressError('POS_MANAGER_CANNOT_BE_ZERO_ADDRESS')
    if (this.riskManager === zeroAddress) throw new ValidateInputZeroAddressError('RISK_MANAGER_CANNOT_BE_ZERO_ADDRESS')
    if (this.config === zeroAddress) throw new ValidateInputZeroAddressError('CONFIG_CANNOT_BE_ZERO_ADDRESS')
  }
}
