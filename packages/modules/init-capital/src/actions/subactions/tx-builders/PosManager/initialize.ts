import { Address, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type InitializePosManagerTxBuilderParams = {
  posManager: Address
  nftName: string
  nftSymbol: string
  initCore: Address
  maxCollCount: number
}

export class InitializePosManagerTxBuilder extends TxBuilder {
  private posManager: Address
  private nftName: string
  private nftSymbol: string
  private initCore: Address
  private maxCollCount: number

  constructor(client: InfinitWallet, params: InitializePosManagerParams) {
    super(InitializePosManagerTxBuilder.name, client)
    this.posManager = getAddress(params.posManager)
    this.nftName = params.nftName
    this.nftSymbol = params.nftSymbol
    this.initCore = getAddress(params.initCore)
    this.maxCollCount = params.maxCollCount
  }

  async buildTx(): Promise<TransactionData> {
    const posManagerArtifact = await readArtifact('PosManager')

    const functionData = encodeFunctionData({
      abi: posManagerArtifact.abi,
      functionName: 'initialize',
      args: [this.nftName, this.nftSymbol, this.initCore, this.maxCollCount],
    })

    const tx: TransactionData = {
      data: functionData,
      to: this.posManager,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
