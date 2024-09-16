import { Address, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { isRiskOrPoolAdmin } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type SetReserveBorrowingTxBuilderParams = {
  asset: Address
  poolConfigurator: Address
  aclManager: Address
  enabled: boolean
}

export class SetReserveBorrowingTxBuilder extends TxBuilder {
  private asset: Address
  private poolConfigurator: Address
  private aclManager: Address
  private enabled: boolean

  constructor(client: InfinitWallet, params: SetReserveBorrowingTxBuilderParams) {
    super(SetReserveBorrowingTxBuilder.name, client)
    this.poolConfigurator = getAddress(params.poolConfigurator)
    this.asset = getAddress(params.asset)
    this.aclManager = getAddress(params.aclManager)
    this.enabled = params.enabled
  }

  async buildTx(): Promise<TransactionData> {
    // contract action
    const params: [Address, boolean] = [this.asset, this.enabled]
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')

    const encodedData = encodeFunctionData({
      abi: poolConfiguratorArtifact.abi,
      functionName: 'setReserveBorrowing',
      args: params,
    })

    return {
      to: this.poolConfigurator,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    const aclManagerArtifact = await readArtifact('ACLManager')
    const flag = await isRiskOrPoolAdmin(this.client, aclManagerArtifact, this.aclManager, this.client.walletClient.account.address)
    if (!flag) {
      throw new ContractValidateError('NOT_RISK_OR_POOL_ADMIN')
    }
  }
}
