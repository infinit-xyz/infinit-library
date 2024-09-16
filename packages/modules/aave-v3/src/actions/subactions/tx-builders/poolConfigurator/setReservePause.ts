import { Address, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { isEmergencyAdmin, isPoolAdmin } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type SetReservePauseTxBuilderParams = {
  asset: Address
  poolConfigurator: Address
  aclManager: Address
  paused: boolean
}

export class SetReservePauseTxBuilder extends TxBuilder {
  private asset: Address
  private poolConfigurator: Address
  private aclManager: Address
  private paused: boolean

  constructor(client: InfinitWallet, params: SetReservePauseTxBuilderParams) {
    super(SetReservePauseTxBuilder.name, client)
    this.poolConfigurator = getAddress(params.poolConfigurator)
    this.asset = getAddress(params.asset)
    this.aclManager = getAddress(params.aclManager)
    this.paused = params.paused
  }

  async buildTx(): Promise<TransactionData> {
    // contract action
    const params: [Address, boolean] = [this.asset, this.paused]
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')
    const encodedData = encodeFunctionData({
      abi: poolConfiguratorArtifact.abi,
      functionName: 'setReservePause',
      args: params,
    })

    return {
      to: this.poolConfigurator,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    const aclManagerArtifact = await readArtifact('ACLManager')
    let flag = await isEmergencyAdmin(this.client, aclManagerArtifact, this.aclManager, this.client.walletClient.account.address)
    flag = flag || (await isPoolAdmin(this.client, aclManagerArtifact, this.aclManager, this.client.walletClient.account.address))
    if (!flag) {
      throw new ContractValidateError('NOT_EMERGENCY_OR_POOL_ADMIN')
    }
  }
}
