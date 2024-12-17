import { Address, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployYTV3CreationCodeTxBuilderParams = {
  baseSplitCodeFactoryContact: Address
}
export class DeployYTV3CreationCodeTxBuilder extends TxBuilder {
  public baseSplitCodeFactoryContact: Address
  public contractName = 'yt-v3'

  constructor(client: InfinitWallet, params: DeployYTV3CreationCodeTxBuilderParams) {
    super(DeployYTV3CreationCodeTxBuilder.name, client)
    this.baseSplitCodeFactoryContact = params.baseSplitCodeFactoryContact
  }

  async buildTx(): Promise<TransactionData> {
    const [baseSplitCodeFactoryContractArtifact, pendleYieldTokenArtifact] = await Promise.all([
      readArtifact('BaseSplitCodeFactoryContract'),
      readArtifact('PendleYieldToken'),
    ])

    const callData = encodeFunctionData({
      abi: baseSplitCodeFactoryContractArtifact.abi,
      functionName: 'deploy',
      args: [this.contractName, pendleYieldTokenArtifact.bytecode],
    })

    const tx: TransactionData = {
      data: callData,
      to: this.baseSplitCodeFactoryContact,
    }
    return tx
  }

  public async validate(): Promise<void> {
    const baseSplitCodeFactoryContractArtifact = await readArtifact('BaseSplitCodeFactoryContract')
    const owner = await this.client.publicClient.readContract({
      address: this.baseSplitCodeFactoryContact,
      abi: baseSplitCodeFactoryContractArtifact.abi,
      functionName: 'owner',
      args: [],
    })

    if (owner !== this.client.walletClient.account.address) {
      throw new ContractValidateError('CALLER_NOT_OWNER')
    }
  }
}
