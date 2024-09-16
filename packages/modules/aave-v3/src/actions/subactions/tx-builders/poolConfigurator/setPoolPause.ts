import { Address, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { isEmergencyAdmin } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type SetPoolPauseTxBuilderParams = {
  poolConfigurator: Address
  aclManager: Address
  paused: boolean
}

export class SetPoolPauseTxBuilder extends TxBuilder {
  private poolConfigurator: Address
  private aclManager: Address
  private paused: boolean

  constructor(client: InfinitWallet, params: SetPoolPauseTxBuilderParams) {
    super(SetPoolPauseTxBuilder.name, client)
    this.poolConfigurator = getAddress(params.poolConfigurator)
    this.aclManager = getAddress(params.aclManager)
    this.paused = params.paused
  }

  async buildTx(): Promise<TransactionData> {
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')
    // contract action
    const params: [boolean] = [this.paused]
    const encodedData = encodeFunctionData({ abi: poolConfiguratorArtifact.abi, functionName: 'setPoolPause', args: params })

    return {
      to: this.poolConfigurator,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    const aclManagerArtifact = await readArtifact('ACLManager')
    const flag = await isEmergencyAdmin(this.client, aclManagerArtifact, this.aclManager, this.client.walletClient.account.address)
    if (!flag) {
      throw new ContractValidateError('NOT_EMERGENCY_ADMIN')
    }
  }
}
