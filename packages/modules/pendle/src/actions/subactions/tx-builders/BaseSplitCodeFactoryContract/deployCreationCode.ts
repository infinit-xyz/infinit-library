import { Address, Hex, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployCreationCodeTxBuilderParams = {
  baseSplitCodeFactoryContact: Address
  contractName: string
  creationCode: Hex
}
export class DeployCreationCodeTxBuilder extends TxBuilder {
  public baseSplitCodeFactoryContact: Address
  public contractName: string
  public creationCode: Hex

  constructor(client: InfinitWallet, params: DeployCreationCodeTxBuilderParams) {
    super(DeployCreationCodeTxBuilder.name, client)
    this.baseSplitCodeFactoryContact = params.baseSplitCodeFactoryContact
    this.contractName = params.contractName
    this.creationCode = params.creationCode
  }

  async buildTx(): Promise<TransactionData> {
    const baseSplitCodeFactoryContractArtifact = await readArtifact('BaseSplitCodeFactoryContract')

    const callData = encodeFunctionData({
      abi: baseSplitCodeFactoryContractArtifact.abi,
      functionName: 'deploy',
      args: [this.contractName, this.creationCode],
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
