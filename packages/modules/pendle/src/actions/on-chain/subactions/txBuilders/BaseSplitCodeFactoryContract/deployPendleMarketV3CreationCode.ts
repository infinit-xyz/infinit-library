import { Libraries, resolveBytecodeWithLinkedLibraries } from '@nomicfoundation/hardhat-viem/internal/bytecode.js'
import { Address, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPendleMarketV3CreationCodeTxBuilderParams = {
  baseSplitCodeFactoryContact: Address
  oracleLib: Address
}

export class DeployPendleMarketV3CreationCodeTxBuilder extends TxBuilder {
  public baseSplitCodeFactoryContact: Address
  public oracleLib: Address
  public contractName = 'pendle-market-v3'

  constructor(client: InfinitWallet, params: DeployPendleMarketV3CreationCodeTxBuilderParams) {
    super(DeployPendleMarketV3CreationCodeTxBuilder.name, client)
    this.baseSplitCodeFactoryContact = params.baseSplitCodeFactoryContact
    this.oracleLib = params.oracleLib
  }

  async buildTx(): Promise<TransactionData> {
    const [baseSplitCodeFactoryContractArtifact, pendleMarketV3Artifact] = await Promise.all([
      readArtifact('BaseSplitCodeFactoryContract'),
      readArtifact('PendleMarketV3'),
    ])

    const libraries: Libraries<Address> = {
      OracleLib: this.oracleLib,
    }
    const bytecode = await resolveBytecodeWithLinkedLibraries(pendleMarketV3Artifact, libraries)

    const callData = encodeFunctionData({
      abi: baseSplitCodeFactoryContractArtifact.abi,
      functionName: 'deploy',
      args: [this.contractName, bytecode],
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
