import { parseUnits } from 'viem'

import { DefaultReserveInterestRateStrategyParams } from '@actions/deployDefaultReserveInterestRateStrategy'

export enum IRMType {
  Stable,
  Volatile,
  Major,
}

export const IRM: Record<IRMType, DefaultReserveInterestRateStrategyParams> = {
  [IRMType.Stable]: {
    optimalUsageRatio: parseUnits('0.9', 27),
    baseVariableBorrowRate: parseUnits('0', 27),
    variableRateSlope1: parseUnits('0.04', 27),
    variableRateSlope2: parseUnits('0.6', 27),
    stableRateSlope1: parseUnits('0.005', 27),
    stableRateSlope2: parseUnits('0.6', 27),
    baseStableRateOffset: parseUnits('0.01', 27),
    stableRateExcessOffset: parseUnits('0.08', 27),
    optimalStableToTotalDebtRatio: parseUnits('0.2', 27),
  },
  [IRMType.Volatile]: {
    optimalUsageRatio: parseUnits('0.45', 27),
    baseVariableBorrowRate: 0n,
    variableRateSlope1: parseUnits('0.07', 27),
    variableRateSlope2: parseUnits('3', 27),
    stableRateSlope1: parseUnits('0.07', 27),
    stableRateSlope2: parseUnits('3', 27),
    baseStableRateOffset: parseUnits('0.02', 27),
    stableRateExcessOffset: parseUnits('0.05', 27),
    optimalStableToTotalDebtRatio: parseUnits('0.2', 27),
  },
  [IRMType.Major]: {
    optimalUsageRatio: parseUnits('0.9', 27),
    baseVariableBorrowRate: 0n,
    variableRateSlope1: parseUnits('0.027', 27),
    variableRateSlope2: parseUnits('0.8', 27),
    stableRateSlope1: parseUnits('0.027', 27),
    stableRateSlope2: parseUnits('0.8', 27),
    baseStableRateOffset: parseUnits('0.01', 27),
    stableRateExcessOffset: parseUnits('0.05', 27),
    optimalStableToTotalDebtRatio: parseUnits('0.2', 27),
  },
}
