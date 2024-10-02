import { Address, encodeFunctionData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError, ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { getReserveData, getReservesList, isRiskOrPoolAdmin } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type SetReserveInterestRateStrategyAddressTxBuilderParams = {
  asset: Address
  interestRateStrategy: Address
  poolConfigurator: Address
  aclManager: Address
  pool: Address
}

export class SetReserveInterestRateStrategyAddressTxBuilder extends TxBuilder {
  private asset: Address
  private interestRateStrategy: Address
  private poolConfigurator: Address
  private aclManager: Address
  private pool: Address

  constructor(client: InfinitWallet, params: SetReserveInterestRateStrategyAddressTxBuilderParams) {
    super(SetReserveInterestRateStrategyAddressTxBuilder.name, client)
    this.asset = getAddress(params.asset)
    this.interestRateStrategy = getAddress(params.interestRateStrategy)
    this.poolConfigurator = getAddress(params.poolConfigurator)
    this.aclManager = getAddress(params.aclManager)
    this.pool = getAddress(params.pool)
  }

  async buildTx(): Promise<TransactionData> {
    // contract action
    const params: [Address, Address] = [this.asset, this.interestRateStrategy]
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')
    const encodedData = encodeFunctionData({
      abi: poolConfiguratorArtifact.abi,
      functionName: 'setReserveInterestRateStrategyAddress',
      args: params,
    })

    return {
      to: this.poolConfigurator,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    if (this.asset === zeroAddress) throw new ValidateInputZeroAddressError('ASSET')
    const [poolArtifact, aclManagerArtifact] = await Promise.all([readArtifact('Pool'), readArtifact('ACLManager')])
    const flag = await isRiskOrPoolAdmin(this.client, aclManagerArtifact, this.aclManager, this.client.walletClient.account.address)
    if (!flag) {
      throw new ContractValidateError('NOT_RISK_OR_POOL_ADMIN')
    }
    const reserves = await getReservesList(this.client, poolArtifact, this.pool)

    const reserveData = await getReserveData(this.client, poolArtifact, this.pool, this.asset)

    if (reserveData.id === 0 && reserves[0] !== this.asset) {
      throw new ContractValidateError('ASSET_NOT_LISTED')
    }
  }
}
