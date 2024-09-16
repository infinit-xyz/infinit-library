import { Address, Hex, encodeDeployData, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployWrappedTokenGatewayV3Params = {
  wrappedNativeTokenAddress: Address
  owner: Address
  pool: Address
}

export class DeployWrappedTokenGatewayV3TxBuilder extends TxBuilder {
  private wrappedNativeTokenAddress: Address
  private owner: Address
  private pool: Address

  constructor(client: InfinitWallet, params: DeployWrappedTokenGatewayV3Params) {
    super(DeployWrappedTokenGatewayV3TxBuilder.name, client)
    this.wrappedNativeTokenAddress = params.wrappedNativeTokenAddress
    this.owner = params.owner
    this.pool = params.pool
  }

  async buildTx(): Promise<TransactionData> {
    const wrappedTokenGatewayV3 = await readArtifact('WrappedTokenGatewayV3')

    const deployData = encodeDeployData({
      abi: wrappedTokenGatewayV3.abi,
      bytecode: wrappedTokenGatewayV3.bytecode as Hex,
      args: [this.wrappedNativeTokenAddress, this.owner, this.pool],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.owner === zeroAddress) {
      throw new ValidateInputValueError('owner cannot be zero address')
    }
  }
}
