import { Address, encodeFunctionData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ContractValidateError } from '@infinit-xyz/core/errors'

import {
  getLiquidationBonus,
  getLiquidationThreshold,
  getLtv,
  getReserveData,
  getTotalSupply,
  isRiskOrPoolAdmin,
} from '@actions/subactions/tx-builders/utils'

import { readArtifact } from '@/src/utils/artifact'

export type ConfigureReserveAsCollateralParams = {
  asset: Address
  pool: Address
  poolConfigurator: Address
  aclManager: Address
  ltv?: bigint
  liquidationThreshold?: bigint
  liquidationBonus?: bigint
}

export class ConfigureReserveAsCollateralTxBuilder extends TxBuilder {
  private asset: Address
  private pool: Address
  private poolConfigurator: Address
  private aclManager: Address
  private ltv: bigint | undefined
  private liquidationThreshold: bigint | undefined
  private liquidationBonus: bigint | undefined

  constructor(client: InfinitWallet, params: ConfigureReserveAsCollateralParams) {
    super(ConfigureReserveAsCollateralTxBuilder.name, client)
    this.asset = getAddress(params.asset)
    this.pool = getAddress(params.pool)
    this.poolConfigurator = getAddress(params.poolConfigurator)
    this.aclManager = getAddress(params.aclManager)
    this.ltv = params.ltv
    this.liquidationThreshold = params.liquidationThreshold
    this.liquidationBonus = params.liquidationBonus
  }

  async buildTx(): Promise<TransactionData> {
    const [poolArtifact, poolConfiguratorArtifact] = await Promise.all([readArtifact('Pool'), readArtifact('PoolConfigurator')])

    const config = await getReserveData(this.client, poolArtifact, this.pool, this.asset).then((data) => data.configuration.data)

    // get ltv, liquidationThreshold and liquidationBonus from contract
    const ltv = this.ltv ?? getLtv(config)
    const liquidationBonus = this.liquidationBonus ?? getLiquidationBonus(config)
    const liquidationThreshold = this.liquidationThreshold ?? getLiquidationThreshold(config)

    const encodedData = encodeFunctionData({
      abi: poolConfiguratorArtifact.abi,
      functionName: 'configureReserveAsCollateral',
      args: [this.asset, ltv, liquidationThreshold, liquidationBonus],
    })

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
    const flag = await isRiskOrPoolAdmin(this.client, aclManagerArtifact, this.aclManager, this.client.walletClient.account.address)
    if (!flag) {
      throw new ContractValidateError('NOT_RISK_OR_POOL_ADMIN')
    }

    const reserveData = await getReserveData(this.client, poolArtifact, this.pool, this.asset)
    const config = reserveData.configuration.data
    const ltv = this.ltv ?? getLtv(config)
    // NOTE: set empty pool as collateral can be hacked
    if (ltv !== 0n) {
      const aTokenTotalSupply = await getTotalSupply(this.client, aTokenArtifact, reserveData.aTokenAddress)

      if (aTokenTotalSupply === 0n) {
        throw new ContractValidateError('EMPTY_POOL')
      }
    }
    const liquidationBonus = this.liquidationBonus ?? getLiquidationBonus(config)
    const liquidationThreshold = this.liquidationThreshold ?? getLiquidationThreshold(config)

    if (ltv > liquidationThreshold) throw new ContractValidateError('LTV should be less than liquidation threshold')
    if (liquidationThreshold === 0n && liquidationBonus !== 0n) {
      throw new ContractValidateError('Liquidation bonus should be 0 if liquidation threshold is 0')
    } else if (liquidationThreshold < 10000n && (liquidationBonus * liquidationBonus + 5000n) / 10000n < 10000n) {
      throw new ContractValidateError('Invalid Reserve Params')
    }
  }
}
