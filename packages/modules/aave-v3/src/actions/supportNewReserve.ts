import { z } from 'zod'

import { Address, Hex } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { AddRiskAdminSubAction, AddRiskAdminSubActionParams } from '@actions/subactions/addRiskAdmin'
import { ConfigureReserveSubActionParams, ConfigureReservesSubAction } from '@actions/subactions/configureReserve'
import { InitReserveSubAction, InitReserveSubActionParams } from '@actions/subactions/initReserve'
import { RemoveRiskAdminSubAction, RemoveRiskAdminSubActionParams } from '@actions/subactions/removeRiskAdmin'
import { SetAssetOracleSourcesSubAction, SetAssetOracleSourcesSubActionParams } from '@actions/subactions/setAssetOracleSources'
import { SupplyReserveSubAction, SupplyReserveSubActionParams } from '@actions/subactions/supplyReserve'

import { AaveV3Registry } from '@/src/type'

type SupportNewReserveActionParams = {
  setupReservesParams: ({
    underlyingAssetDecimals: number
    interestRateStrategyAddress: Address
    underlyingAsset: Address
    incentivesController: Address
    aTokenName: string
    aTokenSymbol: string
    variableDebtTokenName: string
    variableDebtTokenSymbol: string
    stableDebtTokenName: string
    stableDebtTokenSymbol: string
    params: Hex
  } & ConfigureReserveSubActionParams['inputs'][0] & {
      amount: bigint
      onBehalfOf: Address
      referalCode: number
      source: Address
    })[]
}

export const SupportNewReserveActionParamsSchema = z.object({
  setupReservesParams: z
    .array(
      z.object({
        underlyingAssetDecimals: z.number(),
        interestRateStrategyAddress: zodAddress,
        underlyingAsset: zodAddress,
        incentivesController: zodAddress,
        aTokenName: z.string(),
        aTokenSymbol: z.string(),
        variableDebtTokenName: z.string(),
        variableDebtTokenSymbol: z.string(),
        stableDebtTokenName: z.string(),
        stableDebtTokenSymbol: z.string(),
        params: z.custom<Hex>(),
        asset: zodAddress,
        baseLTV: z.bigint(),
        liquidationThreshold: z.bigint(),
        liquidationBonus: z.bigint(),
        reserveFactor: z.bigint(),
        borrowCap: z.bigint(),
        supplyCap: z.bigint(),
        stableBorrowingEnabled: z.boolean(),
        borrowingEnabled: z.boolean(),
        flashLoanEnabled: z.boolean(),
        amount: z.bigint(),
        onBehalfOf: zodAddress,
        referalCode: z.number(),
        source: zodAddress,
      }),
    )
    .describe(`The list of object containing the setup reserve params`),
}) satisfies z.ZodType<SupportNewReserveActionParams>

export type SupportNewReserveData = {
  params: SupportNewReserveActionParams
  signer: Record<string, InfinitWallet>
}

export class SupportNewReserveAction extends Action<SupportNewReserveData, AaveV3Registry> {
  constructor(data: SupportNewReserveData) {
    validateActionData(data, SupportNewReserveActionParamsSchema, ['deployer', 'poolAdmin', 'aclAdmin'])
    super(SupportNewReserveAction.name, data)
  }
  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.aclManager) {
      throw new ValidateInputValueError('registry: aclManager not found')
    }
    if (!registry.poolProxy) {
      throw new ValidateInputValueError('registry: poolProxy not found')
    }
    if (!registry.reservesSetupHelper) {
      throw new ValidateInputValueError('registry: reservesSetupHelper not found')
    }
    if (!registry.poolConfiguratorProxy) {
      throw new ValidateInputValueError('registry: poolConfiguratorProxy not found')
    }
    if (!registry.aaveOracle) {
      throw new ValidateInputValueError('registry: aaveOracle not found')
    }
    if (!registry.aTokenImpl) {
      throw new ValidateInputValueError('registry: aTokenImpl not found')
    }
    if (!registry.stableDebtTokenImpl) {
      throw new ValidateInputValueError('registry: stableDebtTokenImpl not found')
    }
    if (!registry.variableDebtTokenImpl) {
      throw new ValidateInputValueError('registry: variableDebtTokenImpl not found')
    }
    if (!registry.feeVault) {
      throw new ValidateInputValueError('registry: feeVault not found')
    }

    const deployer = this.data.signer['deployer']
    const poolAdmin = this.data.signer['poolAdmin']
    const aclAdmin = this.data.signer['aclAdmin']

    const parameters = this.data.params

    // get only init reserve params
    const initReserveParams: InitReserveSubActionParams = {
      poolConfigurator: registry.poolConfiguratorProxy,
      pool: registry.poolProxy,
      inputs: parameters.setupReservesParams.map((params) => {
        return {
          aTokenImpl: registry.aTokenImpl!,
          stableDebtTokenImpl: registry.stableDebtTokenImpl!,
          variableDebtTokenImpl: registry.variableDebtTokenImpl!,
          underlyingAssetDecimals: params.underlyingAssetDecimals,
          interestRateStrategyAddress: params.interestRateStrategyAddress,
          underlyingAsset: params.underlyingAsset,
          treasury: registry.feeVault!,
          incentivesController: params.incentivesController,
          aTokenName: params.aTokenName,
          aTokenSymbol: params.aTokenSymbol,
          variableDebtTokenName: params.variableDebtTokenName,
          variableDebtTokenSymbol: params.variableDebtTokenSymbol,
          stableDebtTokenName: params.stableDebtTokenName,
          stableDebtTokenSymbol: params.stableDebtTokenSymbol,
          params: params.params,
        }
      }),
    }

    // get only addRiskAdmin params
    // add reserveSetupHelper to riskAdmin
    const addRiskAdminParams: AddRiskAdminSubActionParams = {
      aclManager: registry.aclManager,
      riskAdmin: registry.reservesSetupHelper,
    }

    // get only configure reserve params
    const configureReserveParams: ConfigureReserveSubActionParams = {
      poolConfigurator: registry.poolConfiguratorProxy,
      reservesSetupHelper: registry.reservesSetupHelper,
      inputs: parameters.setupReservesParams.map((params) => {
        return {
          asset: params.asset,
          baseLTV: params.baseLTV,
          liquidationThreshold: params.liquidationThreshold,
          liquidationBonus: params.liquidationBonus,
          reserveFactor: params.reserveFactor,
          borrowCap: params.borrowCap,
          supplyCap: params.supplyCap,
          stableBorrowingEnabled: params.stableBorrowingEnabled,
          borrowingEnabled: params.borrowingEnabled,
          flashLoanEnabled: params.flashLoanEnabled,
        }
      }),
    }

    // get only removeAdmin params
    // remove reserveSetupHelper from riskAdmin
    const removeRiskAdminParams: RemoveRiskAdminSubActionParams = {
      aclManager: registry.aclManager,
      riskAdmin: registry.reservesSetupHelper,
    }

    // get only supply reserve params
    const supplyReserveParams: SupplyReserveSubActionParams = {
      pool: registry.poolProxy,
      reserves: parameters.setupReservesParams.map((params) => {
        return {
          token: params.underlyingAsset,
          amount: params.amount,
          onBehalfOf: params.onBehalfOf,
          referalCode: params.referalCode,
        }
      }),
    }
    // get only set asset sources params
    const setAssetOracleSourcesParams: SetAssetOracleSourcesSubActionParams = {
      oracle: registry.aaveOracle,
      assets: parameters.setupReservesParams.map((params) => params.underlyingAsset),
      sources: parameters.setupReservesParams.map((params) => params.source),
    }

    return [
      new InitReserveSubAction(poolAdmin, initReserveParams),
      new AddRiskAdminSubAction(aclAdmin, addRiskAdminParams),
      new ConfigureReservesSubAction(deployer, configureReserveParams),
      new RemoveRiskAdminSubAction(aclAdmin, removeRiskAdminParams),
      new SupplyReserveSubAction(deployer, supplyReserveParams),
      new SetAssetOracleSourcesSubAction(poolAdmin, setAssetOracleSourcesParams),
    ]
  }
}
