import { InfinitActionRecord } from '@infinit-xyz/core'

import { AddAssetListingAdminAction, AddAssetListingAdminActionParamsSchema } from '@actions/addAssetListingAdmin'
import { AddEmergencyAdminAction, AddEmergencyAdminActionParamsSchema } from '@actions/addEmergencyAdmin'
import { AddPoolAdminAction, AddPoolAdminActionParamsSchema } from '@actions/addPoolAdmin'
import { AddRiskAdminAction, AddRiskAdminActionParamsSchema } from '@actions/addRiskAdmin'
import { DeployAaveV3Action, DeployAaveV3ParamSchema } from '@actions/deployAaveV3'
import {
  DeployDefaultReserveInterestRateStrategyAction,
  DeployDefaultReserveInterestRateStrategyActionParamsSchema,
} from '@actions/deployDefaultReserveInterestRateStrategy'
import { RemoveAssetListingAdminAction, RemoveAssetListingAdminActionParamsSchema } from '@actions/removeAssetListingAdmin'
import { RemoveEmergencyAdminAction, RemoveEmergencyAdminActionParamsSchema } from '@actions/removeEmergencyAdmin'
import { RemovePoolAdminAction, RemovePoolAdminActionParamsSchema } from '@actions/removePoolAdmin'
import { RemoveRiskAdminAction, RemoveRiskAdminActionParamsSchema } from '@actions/removeRiskAdmin'
import { SetLiquidationBonusAction, SetLiquidationBonusActionParamsSchema } from '@actions/setLiquidationBonus'
import { SetLiquidationThresholdAction, SetLiquidationThresholdActionParamsSchema } from '@actions/setLiquidationThreshold'
import { SetLtvAction, SetLtvActionParamsSchema } from '@actions/setLtv'
import { SetReserveBorrowingAction, SetReserveBorrowingActionParamsSchema } from '@actions/setReserveBorrowing'
import { SetReservePauseAction, SetReservePauseActionParamsSchema } from '@actions/setReservePause'
import { SupportNewReserveAction, SupportNewReserveActionParamsSchema } from '@actions/supportNewReserve'

// example of actions
export const actions = {
  init: {
    name: 'Deploy AaveV3',
    actionClassName: DeployAaveV3Action.name,
    paramSchema: DeployAaveV3ParamSchema,
    signers: ['deployer'],
  },
  setLtvAction: {
    name: 'Set LTV',
    actionClassName: SetLtvAction.name,
    paramSchema: SetLtvActionParamsSchema,
    signers: ['poolAdmin'],
  },
  setLiquidationThresholdAction: {
    name: 'Set Liquidation Threshold',
    actionClassName: SetLiquidationThresholdAction.name,
    paramSchema: SetLiquidationThresholdActionParamsSchema,
    signers: ['poolAdmin'],
  },
  setLiquidationBonusAction: {
    name: 'Set Liquidation Bonus',
    actionClassName: SetLiquidationBonusAction.name,
    paramSchema: SetLiquidationBonusActionParamsSchema,
    signers: ['poolAdmin'],
  },
  setReservePauseAction: {
    name: 'Set Reserve Pause',
    actionClassName: SetReservePauseAction.name,
    paramSchema: SetReservePauseActionParamsSchema,
    signers: ['poolAdmin'],
  },
  setReserveBorrowingAction: {
    name: 'Set Reserve Borrowing',
    actionClassName: SetReserveBorrowingAction.name,
    paramSchema: SetReserveBorrowingActionParamsSchema,
    signers: ['poolAdmin'],
  },
  deployDefaultReserveInterestRate: {
    name: 'Deploy Default Reserve Interest Rate Strategy',
    actionClassName: DeployDefaultReserveInterestRateStrategyAction.name,
    paramSchema: DeployDefaultReserveInterestRateStrategyActionParamsSchema,
    signers: ['deployer'],
  },
  supportNewReserves: {
    name: 'Support New Reserves',
    actionClassName: SupportNewReserveAction.name,
    paramSchema: SupportNewReserveActionParamsSchema,
    signers: ['deployer', 'poolAdmin', 'aclAdmin'],
  },
  addAssetListingAdmin: {
    name: 'Add Asset Listing Admin',
    actionClassName: AddAssetListingAdminAction.name,
    paramSchema: AddAssetListingAdminActionParamsSchema,
    signers: ['aclAdmin'],
  },
  addEmergencyAdmin: {
    name: 'Add Emergency Admin',
    actionClassName: AddEmergencyAdminAction.name,
    paramSchema: AddEmergencyAdminActionParamsSchema,
    signers: ['aclAdmin'],
  },
  addPoolAdmin: {
    name: 'Add Pool Admin',
    actionClassName: AddPoolAdminAction.name,
    paramSchema: AddPoolAdminActionParamsSchema,
    signers: ['aclAdmin'],
  },
  addRiskAdmin: {
    name: 'Add Risk Admin',
    actionClassName: AddRiskAdminAction.name,
    paramSchema: AddRiskAdminActionParamsSchema,
    signers: ['aclAdmin'],
  },
  removeAssetListingAdmin: {
    name: 'Remove Asset Listing Admin',
    actionClassName: RemoveAssetListingAdminAction.name,
    paramSchema: RemoveAssetListingAdminActionParamsSchema,
    signers: ['aclAdmin'],
  },
  removeEmergencyAdmin: {
    name: 'Remove Emergency Admin',
    actionClassName: RemoveEmergencyAdminAction.name,
    paramSchema: RemoveEmergencyAdminActionParamsSchema,
    signers: ['aclAdmin'],
  },
  removePoolAdmin: {
    name: 'Remove Pool Admin',
    actionClassName: RemovePoolAdminAction.name,
    paramSchema: RemovePoolAdminActionParamsSchema,
    signers: ['aclAdmin'],
  },
  removeRiskAdmin: {
    name: 'Remove Risk Admin',
    actionClassName: RemoveRiskAdminAction.name,
    paramSchema: RemoveRiskAdminActionParamsSchema,
    signers: ['aclAdmin'],
  },
} satisfies InfinitActionRecord

export {
  AddAssetListingAdminAction,
  AddEmergencyAdminAction,
  AddPoolAdminAction,
  AddRiskAdminAction,
  DeployAaveV3Action,
  DeployDefaultReserveInterestRateStrategyAction,
  RemoveAssetListingAdminAction,
  RemoveEmergencyAdminAction,
  RemovePoolAdminAction,
  RemoveRiskAdminAction,
  SetLiquidationBonusAction,
  SetLiquidationThresholdAction,
  SetLtvAction,
  SetReserveBorrowingAction,
  SetReservePauseAction,
  SupportNewReserveAction,
}