import { Address, Hex, encodeDeployData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPendleYieldContractFactoryTxBuilderParams = {
  ytCreationCodeContractA: Address
  ytCreationCodeSizeA: bigint
  ytCreationCodeContractB: Address
  ytCreationCodeSizeB: bigint
}
export class DeployPendleYieldContractFactoryTxBuilder extends TxBuilder {
  public ytCreationCodeContractA: Address
  public ytCreationCodeSizeA: bigint
  public ytCreationCodeContractB: Address
  public ytCreationCodeSizeB: bigint

  constructor(client: InfinitWallet, params: DeployPendleYieldContractFactoryTxBuilderParams) {
    super(DeployPendleYieldContractFactoryTxBuilder.name, client)

    this.ytCreationCodeContractA = params.ytCreationCodeContractA
    this.ytCreationCodeSizeA = params.ytCreationCodeSizeA
    this.ytCreationCodeContractB = params.ytCreationCodeContractB
    this.ytCreationCodeSizeB = params.ytCreationCodeSizeB
  }

  async buildTx(): Promise<TransactionData> {
    const pendleYieldContractFactoryArtifact = await readArtifact('PendleYieldContractFactory')

    const deployData: Hex = encodeDeployData({
      abi: pendleYieldContractFactoryArtifact.abi,
      bytecode: pendleYieldContractFactoryArtifact.bytecode,
      args: [this.ytCreationCodeContractA, this.ytCreationCodeSizeA, this.ytCreationCodeContractB, this.ytCreationCodeSizeB],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    const codeContractA = await this.client.publicClient.getCode({ address: this.ytCreationCodeContractA })

    if (!codeContractA) {
      throw new ContractValidateError('ContractA is not deployed')
    }

    const codeContractB = await this.client.publicClient.getCode({ address: this.ytCreationCodeContractB })

    if (!codeContractB) {
      throw new ContractValidateError('ContractB is not deployed')
    }
  }
}
