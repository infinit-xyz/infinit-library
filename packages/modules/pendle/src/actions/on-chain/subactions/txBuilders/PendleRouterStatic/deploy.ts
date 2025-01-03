import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPendleRouterStaticParams = {
  storageLayout: Address
}

export class DeployPendleRouterStaticTxBuilder extends TxBuilder {
  private storageLayout: Address

  constructor(client: InfinitWallet, params: DeployPendleRouterStaticParams) {
    super(DeployPendleRouterStaticTxBuilder.name, client)
    this.storageLayout = getAddress(params.storageLayout)
  }

  async buildTx(): Promise<TransactionData> {
    const PendleRouterStaticArtifact = await readArtifact('PendleRouterStatic')

    if (this.storageLayout === zeroAddress) throw new ValidateInputZeroAddressError('STORAGE_LAYOUT')

    const deployData: Hex = encodeDeployData({
      abi: PendleRouterStaticArtifact.abi,
      bytecode: PendleRouterStaticArtifact.bytecode as Hex,
      args: [this.storageLayout],
    })

    const tx: TransactionData = {
      data: deployData as Hex,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
