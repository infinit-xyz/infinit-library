import { z } from 'zod'

import { Address } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { DeployDoubleSlopeIRMSubActionMsg, DeployDoubleSlopeIRMsSubAction } from '@actions/subactions/deployDoubleSlopeIRMs'
import { DeployDoubleSlopeIRMTxBuilderParams } from '@actions/subactions/tx-builders/DoubleSlopeIRM/deploy'

import { DeployLendingPoolProxySubAction, DeployLendingPoolSubActionMsg } from './subactions/deployLendingPoolProxy'
import { InitializeLendingPoolSubAction } from './subactions/initializePool'
import { SetModeAndTokenLiqMultiplierSubAction } from './subactions/setModeAndTokenLiqMultiplier'
import { SetModeDebtCeilingInfosSubAction } from './subactions/setModeDebtCeilingInfos'
import { SetModePoolFactorsSubAction } from './subactions/setModePoolFactors'
import { SetModeStatusesDefaultSubAction } from './subactions/setModeStatusesDefault'
import { SetPoolConfigSubAction } from './subactions/setPoolConfig'
import { InitCapitalRegistry } from '@/src/type'

export type ModeConfig = {
  mode: number
  poolConfig: {
    collFactor: bigint
    borrFactor: bigint
    debtCeiling: bigint
  }
  config?: {
    liqIncentiveMultiplier_e18: bigint
    minLiqIncentiveMultiplier_e18: bigint
  }
}

export type PythParams = {
  priceFeed: Address
  maxStaleTime: bigint
}

export type Api3Params = {
  dataFeedProxy: Address
  maxStaleTime: bigint
}

export type LsdApi3Params = {
  dataFeedProxy?: Address
  maxStaleTime?: bigint
  setQuoteToken?: Address
}

const oracleReader = z.discriminatedUnion('type', [
  z.object({ type: z.literal('api3'), params: z.custom<Api3Params>() }),
  z.object({ type: z.literal('lsdApi3'), params: z.custom<LsdApi3Params>() }),
  z.object({ type: z.literal('pyth'), params: z.custom<PythParams>() }),
])

export const SupportNewPoolParamsSchema = z.object({
  name: z.string().describe(`Name of the pool`),
  token: zodAddressNonZero.describe(`Address of the token`),
  modeConfigs: z.tuple([z.custom<ModeConfig>()]).describe(`mode configs for adding new mode`),
  liqcentiveMultiplier_e18: z.bigint().describe(`liq incentive multiplier e18`).optional(),
  supplyCap: z.bigint().describe(`lending pool supply cap`),
  borrowCap: z.bigint().describe(`lending pool borrow cap`),
  reserveFactor: z.bigint().describe(`lending pool reserve factor`),
  treasury: zodAddressNonZero.describe(`fee receiver address`),
  oracleConfig: z
    .object({
      primarySource: oracleReader.describe(`Primary source address e.g. deployed api3ProxyOracleReaderProxy address`),
      secondarySource: oracleReader.optional().describe(`Secondary source address e.g. deployed api3ProxyOracleReaderProxy address`),
    })
    .optional(),
  doubleSlopeIRMConfig: z.object({
    name: z.string().describe(`Name of the reserve interest rate model that will be displayed in the registry`),
    params: z
      .object({
        baseBorrowRateE18: z.bigint().describe(`Base borrow rate in E18 (e.g., 10% = 0.1 * 1e18)`),
        jumpUtilizationRateE18: z
          .bigint()
          .describe(`Utilization rate in E18 where the jump multiplier is applied (e.g., 80% = 0.8 * 1e18)`),
        borrowRateMultiplierE18: z.bigint().describe(`Borrow rate multiplier in E18 (e.g., 1% = 0.01 * 1e18)`),
        jumpRateMultiplierE18: z.bigint().describe(`Jump multiplier rate in E18 (e.g., 1% = 0.01 * 1e18)`),
      })
      .describe(
        `Parameters for the reserve interest rate model => real borrow rate = baseRate + borrowRate * min(currentUtil, jumpUtil) + jumpRate * max(0, uti - jumpUtil)`,
      ) satisfies z.ZodType<DeployDoubleSlopeIRMTxBuilderParams>,
  }),
})

export type SupportNewPoolParams = z.infer<typeof SupportNewPoolParamsSchema>

export type SupportNewPoolActionData = {
  params: SupportNewPoolParams
  signer: Record<'deployer' | 'guardian' | 'governor', InfinitWallet>
}

export class SupportNewPoolAction extends Action<SupportNewPoolActionData, InitCapitalRegistry> {
  constructor(data: SupportNewPoolActionData) {
    validateActionData(data, SupportNewPoolParamsSchema, ['governor'])
    super(SupportNewPoolAction.name, data)
  }

  protected getSubActions(registry: InitCapitalRegistry): ((message: any) => SubAction)[] {
    const deployer = this.data.signer['deployer']
    const guardian = this.data.signer['guardian']
    const governor = this.data.signer['governor']

    const doubleSlopeIRMConfig = this.data.params.doubleSlopeIRMConfig
    const initializePoolConfig = {
      underlyingToken: this.data.params.token,
      name: this.data.params.name,
      symbol: this.data.params.name,
      reserveFactor: this.data.params.reserveFactor,
      treasury: this.data.params.treasury,
    }

    return [
      // steps
      // 1. deploy irm
      () =>
        new DeployDoubleSlopeIRMsSubAction(governor, {
          doubleSlopeIRMConfigs: [
            {
              name: doubleSlopeIRMConfig.name,
              params: {
                baseBorrowRateE18: doubleSlopeIRMConfig.params.baseBorrowRateE18,
                jumpUtilizationRateE18: doubleSlopeIRMConfig.params.jumpUtilizationRateE18,
                borrowRateMultiplierE18: doubleSlopeIRMConfig.params.borrowRateMultiplierE18,
                jumpRateMultiplierE18: doubleSlopeIRMConfig.params.jumpRateMultiplierE18,
              },
            },
          ],
        }),
      // 2. deploy lending pool proxy
      () => {
        // validate registry
        if (!registry.lendingPoolImpl) throw new Error('registry: lendingPoolImpl not found')
        if (!registry.proxyAdmin) throw new Error('registry: proxy admin not found')
        return new DeployLendingPoolProxySubAction(deployer, {
          name: this.data.params.name,
          proxyAdmin: registry.proxyAdmin,
          lendingPoolImpl: registry.lendingPoolImpl,
        })
      },
      // 3. initialize lending proxy
      (message: DeployLendingPoolSubActionMsg & DeployDoubleSlopeIRMSubActionMsg) =>
        new InitializeLendingPoolSubAction(deployer, {
          lendingPool: message.lendingPoolProxy,
          underlingToken: initializePoolConfig.underlyingToken,
          name: initializePoolConfig.name,
          symbol: initializePoolConfig.symbol,
          irm: message.doubleSlopeIrms[doubleSlopeIRMConfig.name],
          reserveFactor: initializePoolConfig.reserveFactor,
          treasury: initializePoolConfig.treasury,
        }),
      // 4. set pool config (guardian)
      (message: DeployLendingPoolSubActionMsg) => {
        // validate registry
        if (!registry.configProxy) throw new Error('registry: configProxy not found')
        return new SetPoolConfigSubAction(guardian, {
          config: registry.configProxy,
          batchPoolConfigParams: [
            {
              pool: message.lendingPoolProxy,
              poolConfig: {
                // set pool caps
                supplyCap: this.data.params.supplyCap,
                borrowCap: this.data.params.borrowCap,
                // enable all as default
                canMint: true,
                canBurn: true,
                canBorrow: true,
                canRepay: true,
                canFlash: true,
              },
            },
          ],
        })
      },
      // 5. set token oracle (if needed)
      // set primary token, secondary token
      // set token oracle reader
      // TODO
      // 6. set liq sub actions
      // set token liq calculator (liq incentive multiplier) (if needed) (governor)
      // set mode liq calculator (min, max liq incentive multiplier) (if needed)(governor)
      () => {
        // validate registry
        if (!registry.liqIncentiveCalculatorProxy) throw new Error('registry: liqIncentiveCalculatorProxy not found')
        return new SetModeAndTokenLiqMultiplierSubAction(governor, {
          liqIncentiveCalculator: registry.liqIncentiveCalculatorProxy,
          tokenLiqIncentiveMultiplierConfig: {
            token: this.data.params.token,
            multiplier_e18: this.data.params.liqcentiveMultiplier_e18,
          },
          modeLiqIncentiveMultiplierConfigs: this.data.params.modeConfigs.map((modeConfig) => {
            return {
              mode: modeConfig.mode,
              config: modeConfig.config,
            }
          }),
        })
      },
      // 7. setModeConfigs (governor)
      // TODO
      //set pool mode factor (if needed) (governor)
      (message: DeployLendingPoolSubActionMsg) => {
        // validate registry
        if (!registry.configProxy) throw new Error('registry: configProxy not found')
        return new SetModePoolFactorsSubAction(governor, {
          config: registry.configProxy,
          modePoolFactors: this.data.params.modeConfigs.map((modeConfig) => {
            return {
              mode: modeConfig.mode,
              poolFactors: [
                {
                  pool: message.lendingPoolProxy,
                  collFactor_e18: modeConfig.poolConfig.collFactor,
                  borrFactor_e18: modeConfig.poolConfig.borrFactor,
                },
              ],
            }
          }),
        })
      },
      // 8. set mode status(guardian)
      () => {
        // validate registry
        if (!registry.configProxy) throw new Error('registry: configProxy not found')
        const modeStatuses = this.data.params.modeConfigs.map((modeConfig) => {
          const isNew = modeConfig.config ? true : false
          return { mode: modeConfig.mode, isNew: isNew }
        })
        return new SetModeStatusesDefaultSubAction(guardian, {
          config: registry.configProxy,
          modeStatuses: modeStatuses,
        })
      },
      // 9. set risk manager mode debt ceiling (guardian)
      (message: DeployLendingPoolSubActionMsg) => {
        // validate registry
        if (!registry.riskManagerProxy) throw new Error('registry: riskManagerProxy not found')

        const modeDebtCeilingInfos = this.data.params.modeConfigs.map((modeConfig) => {
          return {
            mode: modeConfig.mode,
            pools: [message.lendingPoolProxy],
            ceilAmts: [modeConfig.poolConfig?.debtCeiling],
          }
        })

        return new SetModeDebtCeilingInfosSubAction(guardian, {
          riskManager: registry.riskManagerProxy,
          modeDebtCeilingInfos: modeDebtCeilingInfos,
        })
      },
    ]
  }
}
