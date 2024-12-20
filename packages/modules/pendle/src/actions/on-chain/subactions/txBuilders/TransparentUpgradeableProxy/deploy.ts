import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type TransparentUpgradeableProxyTxBuilderParams = {
  logic: Address
  admin: Address
  data: Hex
}

export class DeployTransparentUpgradeableProxyTxBuilder extends TxBuilder {
  private logic: Address
  private admin: Address
  private data: Hex

  constructor(client: InfinitWallet, params: TransparentUpgradeableProxyTxBuilderParams) {
    super(DeployTransparentUpgradeableProxyTxBuilder.name, client)
    this.logic = getAddress(params.logic)
    this.admin = getAddress(params.admin)
    this.data = params.data
  }

  async buildTx(): Promise<TransactionData> {
    const transparentUpgradeableProxyArtifact = await readArtifact('TransparentUpgradeableProxy')
    const deployData: Hex = encodeDeployData({
      abi: transparentUpgradeableProxyArtifact.abi,
      bytecode: transparentUpgradeableProxyArtifact.bytecode as Hex,
      args: [this.logic, this.admin, this.data],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.logic === zeroAddress) throw new ValidateInputZeroAddressError('LOGIC')
    if (this.admin === zeroAddress) throw new ValidateInputZeroAddressError('ADMIN')
  }
}
