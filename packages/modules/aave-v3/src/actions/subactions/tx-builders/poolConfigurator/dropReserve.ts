import { Address, encodeFunctionData } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import { getReserveData, getReservesList, getTotalSupply, isPoolAdmin } from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type DropReserveTxBuilderParams = {
  asset: Address
  pool: Address
  poolConfigurator: Address
  aclManager: Address
}

export class DropReserveTxBuilder extends TxBuilder {
  private asset: Address
  private pool: Address
  private poolConfigurator: Address
  private aclManager: Address

  constructor(client: InfinitWallet, params: DropReserveTxBuilderParams) {
    super(DropReserveTxBuilder.name, client)
    this.poolConfigurator = params.poolConfigurator
    this.asset = params.asset
    this.pool = params.pool
    this.aclManager = params.aclManager
  }

  async buildTx(): Promise<TransactionData> {
    // contract action
    const params: [Address] = [this.asset]
    const poolConfiguratorArtifact = await readArtifact('PoolConfigurator')
    const encodedData = encodeFunctionData({ abi: poolConfiguratorArtifact.abi, functionName: 'dropReserve', args: params })
    return {
      to: this.poolConfigurator,
      data: encodedData,
    }
  }

  public async validate(): Promise<void> {
    const [poolArtifact, aclManagerArtifact, aTokenArtifact] = await Promise.all([
      readArtifact('Pool'),
      readArtifact('ACLManager'),
      readArtifact('AToken'),
    ])
    if (!(await isPoolAdmin(this.client, aclManagerArtifact, this.aclManager, this.client.walletClient.account.address))) {
      throw new ContractValidateError('NOT_POOL_ADMIN')
    }
    const reserves = await getReservesList(this.client, poolArtifact, this.pool)
    const reserveData = await getReserveData(this.client, poolArtifact, this.pool, this.asset)

    if (reserveData.id === 0 && reserves[0] !== this.asset) {
      throw new ContractValidateError('ASSET_NOT_LISTED')
    }
    const stableDebtTokenTotalSupply = await getTotalSupply(this.client, aTokenArtifact, reserveData.stableDebtTokenAddress)
    if (stableDebtTokenTotalSupply !== 0n) {
      throw new ContractValidateError('STABLE_DEBT_NOT_ZERO')
    }
    const variableDebtTokenTotalSupply = await getTotalSupply(this.client, aTokenArtifact, reserveData.variableDebtTokenAddress)
    if (variableDebtTokenTotalSupply !== 0n) {
      throw new ContractValidateError('VARIABLE_DEBT_SUPPLY_NOT_ZERO')
    }
    const aTokenTotalSupply = await getTotalSupply(this.client, aTokenArtifact, reserveData.aTokenAddress)
    if (aTokenTotalSupply !== 0n) {
      throw new ContractValidateError('UNDERLYING_CLAIMABLE_RIGHTS_NOT_ZERO')
    }
  }
}
