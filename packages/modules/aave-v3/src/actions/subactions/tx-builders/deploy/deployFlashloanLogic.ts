import { resolveBytecodeWithLinkedLibraries } from '@nomicfoundation/hardhat-viem/internal/bytecode.js'
import { Address, Hex } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export type DeployFlashLoanLogicParams = {
  borrowLogic: Address
}

export class DeployFlashLoanLogicTxBuilder extends TxBuilder {
  private borrowLogic: Address

  constructor(client: InfinitWallet, params: DeployFlashLoanLogicParams) {
    super(DeployFlashLoanLogicTxBuilder.name, client)
    this.borrowLogic = params.borrowLogic
  }

  async buildTx(): Promise<TransactionData> {
    const libraries = {
      BorrowLogic: this.borrowLogic,
    }
    const FlashLoanLogicArtifact = await readArtifact('FlashLoanLogic')
    const bytecode: Hex = await resolveBytecodeWithLinkedLibraries(FlashLoanLogicArtifact, libraries)

    const tx: TransactionData = {
      data: bytecode,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {}
}
