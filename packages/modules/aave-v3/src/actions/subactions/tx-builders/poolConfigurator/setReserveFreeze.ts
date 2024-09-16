import { Address, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { isRiskOrPoolAdmin } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type SetReserveFreezeTxBuilderParams = {
  asset: Address
  poolConfigurator: Address
  aclManager: Address
  freeze: boolean
}

export class SetReserveFreezeTxBuilder extends TxBuilder {
  private asset: Address
  private poolConfigurator: Address
  private aclManager: Address
  private freeze: boolean

  constructor(client: InfinitWallet, params: SetReserveFreezeTxBuilderParams) {
    super(SetReserveFreezeTxBuilder.name, client)
    this.poolConfigurator = getAddress(params.poolConfigurator)
    this.asset = getAddress(params.asset)
    this.aclManager = getAddress(params.aclManager)
    this.freeze = params.freeze
  }

  async buildTx(): Promise<TransactionData> {
    // contract action
    const params: [Address, boolean] = [this.asset, this.freeze]
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')

    const encodedData = encodeFunctionData({
      abi: poolConfiguratorArtifact.abi,
      functionName: 'setReserveFreeze',
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
