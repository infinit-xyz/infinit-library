import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPoolAddressProviderParams = {
  marketId: string
  owner: Address
}

export class DeployPoolAddressProviderTxBuilder extends TxBuilder {
  private marketId: string
  private owner: Address

  constructor(client: InfinitWallet, params: DeployPoolAddressProviderParams) {
    super(DeployPoolAddressProviderTxBuilder.name, client)
    this.marketId = params.marketId
    this.owner = getAddress(params.owner)
  }

  async buildTx(): Promise<TransactionData> {
    const poolAddressesProviderArtifact = await readArtifact('PoolAddressesProvider')

    const deployData = encodeDeployData({
      abi: poolAddressesProviderArtifact.abi,
      bytecode: poolAddressesProviderArtifact.bytecode as Hex,
      args: [this.marketId, this.owner],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.owner === zeroAddress) throw new ValidateInputZeroAddressError('OWNER')
  }
}
