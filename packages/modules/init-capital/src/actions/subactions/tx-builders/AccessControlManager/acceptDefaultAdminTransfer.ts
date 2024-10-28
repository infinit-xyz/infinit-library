import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type AcceptDefaultAdminTransferTxBuilderParams = {
  accessControlManager: Address
}

export class AcceptDefaultAdminTransferTxBuilder extends TxBuilder {
  private accessControlManager: Address

  constructor(client: InfinitWallet, params: AcceptDefaultAdminTransferTxBuilderParams) {
    super(AcceptDefaultAdminTransferTxBuilder.name, client)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const accessControlManagerArtifact = await readArtifact('AccessControlManager')
    const encodedData = encodeFunctionData({ abi: accessControlManagerArtifact.abi, functionName: 'acceptDefaultAdminTransfer', args: [] })
    return {
      to: this.accessControlManager,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    if (this.accessControlManager === zeroAddress) throw new ValidateInputValueError('ProxyAdmin cannot be zero address')
    const accessControlManagerArtifact = await readArtifact('AccessControlManager')
    const [newOwner, schedule] = await this.client.publicClient.readContract({
      address: this.accessControlManager,
      abi: accessControlManagerArtifact.abi,
      functionName: 'pendingDefaultAdmin',
      args: [],
    })
    if (this.client.walletClient.account.address !== newOwner) throw new ContractValidateError('only owner can transfer owner')
    // get block timestamp
    const block = await this.client.publicClient.getBlock()
    console.log('block', block.timestamp)
    console.log('schedule', schedule)
    if (block.timestamp <= schedule) throw new ContractValidateError('transfer delay not passed')
  }
}
