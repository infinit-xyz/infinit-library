import { z } from 'zod'

import { Address, maxUint64, zeroAddress } from 'viem'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { DeployDoubleSlopeIRMSubActionMsg, DeployDoubleSlopeIRMsSubAction } from '@actions/subactions/deployDoubleSlopeIRMs'
import { DeployDoubleSlopeIRMTxBuilderParams } from '@actions/subactions/tx-builders/DoubleSlopeIRM/deploy'

import { DeployLendingPoolProxySubAction, DeployLendingPoolSubActionMsg } from './subactions/deployLendingPoolProxy'
import { InitializeLendingPoolSubAction } from './subactions/initializePool'
import { SetInitOracleConfigSubAction } from './subactions/setInitOracle'
import { SetMaxHealthAfterLiqSubAction } from './subactions/setMaxHealthAfterLiq'
import { SetModeAndTokenLiqMultiplierSubAction } from './subactions/setModeAndTokenLiqMultiplier'
import { SetModeDebtCeilingInfosSubAction } from './subactions/setModeDebtCeilingInfos'
import { SetModePoolFactorsSubAction } from './subactions/setModePoolFactors'
import { SetModeStatusesDefaultSubAction } from './subactions/setModeStatusesDefault'
import {
  Api3Params,
  LsdApi3Params,
  PythParams,
  SetNewPoolOracleReaderSubAction,
  SetNewPoolOracleReaderSubActionParams,
} from './subactions/setNewPoolOracleReader'
import { SetPoolConfigSubAction } from './subactions/setPoolConfig'
import { InitCapitalRegistry } from '@/src/type'

export type ModeConfig = {
  mode: number
  poolConfig: {
    collFactorE18: bigint
    borrFactorE18: bigint
    debtCeiling: bigint
  }
  config?: {
    liqIncentiveMultiplierE18: bigint
    minLiqIncentiveMultiplierE18: bigint
    maxHealthAfterLiqE18: bigint
  }
}

export const oracleReader = z.discriminatedUnion('type', [
  z.object({ type: z.literal('api3'), params: z.custom<Api3Params>() }),
  z.object({ type: z.literal('lsdApi3'), params: z.custom<LsdApi3Params>() }),
  z.object({ type: z.literal('pyth'), params: z.custom<PythParams>() }),
])

export const oracleReaderRegistryName: Record<'api3' | 'lsdApi3' | 'pyth', keyof InitCapitalRegistry> = {
  api3: 'api3ProxyOracleReaderProxy',
  lsdApi3: 'lsdApi3ProxyOracleReaderProxy',
  pyth: 'pythOracleReaderProxy',
}

export const SupportNewPoolActionParamsSchema = z.object({
  name: z.string().describe(`Name of the pool e.g. POOL_WBTC`),
  token: zodAddressNonZero.describe(`Address of the token e.g. WBTC`),
  modeConfigs: z
    .array(
      z.object({
        mode: z.number().describe(`Mode number starting from 0`),
        poolConfig: z
          .object({
            collFactorE18: z
              .bigint()
              .nonnegative()
              .describe(`Collateral factor in E18, should be less than 1e18, e.g. parseUnit('0.8', 18)`),
            borrFactorE18: z
              .bigint()
              .nonnegative()
              .describe(`Borrow factor in E18, should be greater than 1e18, e.g. parseUnit('1.1', 18)`),
            debtCeiling: z
              .bigint()
              .nonnegative()
              .describe(
                `Debt ceiling for the pool in this mode, user could no longer borrow from the pool for this mode if the debt ceiling is reached`,
              ),
          })
          .describe(`Pool config`),
        config: z.object({
          liqIncentiveMultiplierE18: z.bigint().nonnegative().describe(`Liq incentive multiplier e18`),
          minLiqIncentiveMultiplierE18: z.bigint().nonnegative().describe(`Min liq incentive multiplier e18`),
          maxHealthAfterLiqE18: z.bigint().describe(`Max Health after liq in E18, skip the if set to maxUint64 (${maxUint64})`),
        }),
      }) satisfies z.ZodType<ModeConfig>,
    )
    .describe(`mode configs for adding new mode`),
  liqIncentiveMultiplierE18: z.bigint().nonnegative().describe(`liq incentive multiplier e18`),
  supplyCap: z.bigint().nonnegative().describe(`lending pool supply cap`),
  borrowCap: z.bigint().nonnegative().describe(`lending pool borrow cap`),
  reserveFactor: z.bigint().nonnegative().describe(`lending pool reserve factor`),
  treasury: zodAddressNonZero.describe(`fee receiver address`),
  oracleConfig: z
    .object({
      primarySource: oracleReader.describe(`Primary source oracle reader config`),
      secondarySource: oracleReader.optional().describe(`Secondary source oracle reader config, need to set maxPrivceDeviationE18 if set.`),
      maxPriceDeviationE18: z
        .bigint()
        .optional()
        .describe(`Max price deviation between primary and secondary sources in E18, need to set secondarySource if set.`),
    })
    .optional()
    .describe(''),
  doubleSlopeIRMConfig: z.object({
    name: z.string().describe(`Name of the reserve interest rate model that will be displayed in the registry.`),
    params: z
      .object({
        baseBorrowRateE18: z.bigint().describe(`Base borrow rate in E18 (e.g., 10% = 0.1 * 1e18).`),
        jumpUtilizationRateE18: z
          .bigint()
          .describe(`Utilization rate in E18 where the jump multiplier is applied (e.g., 80% = 0.8 * 1e18).`),
        borrowRateMultiplierE18: z.bigint().describe(`Borrow rate multiplier in E18 (e.g., 1% = 0.01 * 1e18).`),
        jumpRateMultiplierE18: z.bigint().describe(`Jump multiplier rate in E18 (e.g., 1% = 0.01 * 1e18).`),
      })
      .describe(
        `Parameters for the reserve interest rate model => real borrow rate = baseRate + borrowRate * min(currentUtil, jumpUtil) + jumpRate * max(0, uti - jumpUtil)`,
      ) satisfies z.ZodType<DeployDoubleSlopeIRMTxBuilderParams>,
  }),
})

export type SupportNewPoolActionParams = z.infer<typeof SupportNewPoolActionParamsSchema>

export const SupportNewPoolsActionParamsSchema = z.object({
  pools: z.array(SupportNewPoolActionParamsSchema),
})

export type SupportNewPoolsActionParams = z.infer<typeof SupportNewPoolsActionParamsSchema>

export type SupportNewPoolsActionData = {
  params: SupportNewPoolsActionParams
  signer: Record<'deployer' | 'guardian' | 'governor', InfinitWallet>
}

export class SupportNewPoolsAction extends Action<SupportNewPoolsActionData, InitCapitalRegistry> {
  constructor(data: SupportNewPoolsActionData) {
    validateActionData(data, SupportNewPoolsActionParamsSchema, ['governor'])
    super(SupportNewPoolsAction.name, data)
  }

  private newPoolSubActions(registry: InitCapitalRegistry, newPoolParams: SupportNewPoolActionParams): ((message: any) => SubAction)[] {
    const deployer = this.data.signer['deployer']
    const guardian = this.data.signer['guardian']
    const governor = this.data.signer['governor']

    return [
      // steps
      // 1. deploy irm
      () => {
        const doubleSlopeIRMConfig = newPoolParams.doubleSlopeIRMConfig
        return new DeployDoubleSlopeIRMsSubAction(governor, {
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
        })
      },
      // 2. deploy lending pool proxy
      () => {
        // validate registry
        if (!registry.lendingPoolImpl) throw new ValidateInputValueError('registry: lendingPoolImpl not found')
        if (!registry.proxyAdmin) throw new ValidateInputValueError('registry: proxy admin not found')

        return new DeployLendingPoolProxySubAction(deployer, {
          name: newPoolParams.name,
          proxyAdmin: registry.proxyAdmin,
          lendingPoolImpl: registry.lendingPoolImpl,
        })
      },
      // 3. initialize lending proxy
      (message: DeployLendingPoolSubActionMsg & DeployDoubleSlopeIRMSubActionMsg) => {
        const initializePoolConfig = {
          underlyingToken: newPoolParams.token,
          name: newPoolParams.name,
          symbol: newPoolParams.name,
          reserveFactor: newPoolParams.reserveFactor,
          treasury: newPoolParams.treasury,
        }
        return new InitializeLendingPoolSubAction(deployer, {
          lendingPool: message.lendingPoolProxy,
          underlingToken: initializePoolConfig.underlyingToken,
          name: initializePoolConfig.name,
          symbol: initializePoolConfig.symbol,
          irm: message.doubleSlopeIrms[newPoolParams.doubleSlopeIRMConfig.name],
          reserveFactor: initializePoolConfig.reserveFactor,
          treasury: initializePoolConfig.treasury,
        })
      },
      // 4. set pool config (guardian)
      (message: DeployLendingPoolSubActionMsg) => {
        // validate registry
        if (!registry.configProxy) throw new ValidateInputValueError('registry: configProxy not found')

        return new SetPoolConfigSubAction(guardian, {
          config: registry.configProxy,
          batchPoolConfigParams: [
            {
              pool: message.lendingPoolProxy,
              poolConfig: {
                // set pool caps
                supplyCap: newPoolParams.supplyCap,
                borrowCap: newPoolParams.borrowCap,
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
      // 5.1 set token oracle (if needed)
      // set primary token, secondary token, maxPriceDeviations
      () => {
        let primarySourceAddress: Address | undefined
        let secondarySourceAddress: Address | undefined
        const oracleConfig = newPoolParams.oracleConfig
        // validate registry
        if (!registry.initOracleProxy) throw new ValidateInputValueError('registry: initOracleProxy not found')
        // get primary address
        if (oracleConfig && oracleConfig.primarySource) {
          const primarySourceRegistryName = oracleReaderRegistryName[oracleConfig.primarySource.type]
          if (!registry[primarySourceRegistryName]) throw new ValidateInputValueError(`registry: ${primarySourceRegistryName} not found`)
          primarySourceAddress = registry[primarySourceRegistryName] as Address
        }
        // get secondary address
        if (oracleConfig && oracleConfig.secondarySource) {
          const secondarySourceRegistryName = oracleReaderRegistryName[oracleConfig.secondarySource.type]
          if (!registry[secondarySourceRegistryName])
            throw new ValidateInputValueError(`registry: ${secondarySourceRegistryName} not found`)
          secondarySourceAddress = registry[secondarySourceRegistryName] as Address
        }

        return new SetInitOracleConfigSubAction(governor, {
          initOracle: registry.initOracleProxy,
          tokenConfigs: [
            {
              token: newPoolParams.token,
              primarySource: primarySourceAddress,
              secondarySource: secondarySourceAddress,
              maxPriceDeviation_e18: newPoolParams.oracleConfig?.maxPriceDeviationE18,
            },
          ],
        })
      },
      // 5.2 set token oracle reader
      () => {
        const setNewPoolOracleReaderSubActionParams: SetNewPoolOracleReaderSubActionParams = {
          primarySource: undefined,
          secondarySource: undefined,
        }
        let primarySourceAddress: Address = zeroAddress
        let secondarySourceAddress: Address = zeroAddress
        const oracleConfig = newPoolParams.oracleConfig
        // validate registry
        if (!registry.initOracleProxy) throw new ValidateInputValueError('registry: initOracleProxy not found')
        // set primary source
        if (oracleConfig && oracleConfig.primarySource) {
          const primarySourceRegistryName = oracleReaderRegistryName[oracleConfig.primarySource.type]
          if (!registry[primarySourceRegistryName]) throw new ValidateInputValueError(`registry: ${primarySourceRegistryName} not found`)
          primarySourceAddress = registry[primarySourceRegistryName] as Address

          setNewPoolOracleReaderSubActionParams.primarySource = {
            type: oracleConfig?.primarySource?.type,
            token: newPoolParams.token,
            oracleReader: primarySourceAddress,
            params: oracleConfig?.primarySource?.params,
          }
        }
        // set secondary source
        if (oracleConfig && oracleConfig.secondarySource) {
          const secondarySourceRegistryName = oracleReaderRegistryName[oracleConfig.secondarySource.type]
          if (!registry[secondarySourceRegistryName])
            throw new ValidateInputValueError(`registry: ${secondarySourceRegistryName} not found`)
          secondarySourceAddress = registry[secondarySourceRegistryName] as Address
          setNewPoolOracleReaderSubActionParams.secondarySource = {
            type: oracleConfig?.secondarySource?.type,
            token: newPoolParams.token,
            oracleReader: secondarySourceAddress,
            params: oracleConfig?.secondarySource?.params,
          }
        }
        return new SetNewPoolOracleReaderSubAction(governor, setNewPoolOracleReaderSubActionParams)
      },
      // 6. set liq sub actions
      // set token liq calculator (liq incentive multiplier) (if needed) (governor)
      // set mode liq calculator (min, max liq incentive multiplier) (if needed)(governor)
      () => {
        // validate registry
        if (!registry.liqIncentiveCalculatorProxy) throw new ValidateInputValueError('registry: liqIncentiveCalculatorProxy not found')
        return new SetModeAndTokenLiqMultiplierSubAction(governor, {
          liqIncentiveCalculator: registry.liqIncentiveCalculatorProxy,
          tokenLiqIncentiveMultiplierConfig: {
            token: newPoolParams.token,
            multiplier_e18: newPoolParams.liqIncentiveMultiplierE18,
          },
          modeLiqIncentiveMultiplierConfigs: newPoolParams.modeConfigs.map((modeConfig) => {
            return {
              mode: modeConfig.mode,
              config: {
                liqIncentiveMultiplier_e18: modeConfig.config.liqIncentiveMultiplierE18,
                minLiqIncentiveMultiplier_e18: modeConfig.config.minLiqIncentiveMultiplierE18,
              },
            }
          }),
        })
      },
      // 7. set max health after liq (guardian)
      () => {
        // validate registry
        if (!registry.configProxy) throw new ValidateInputValueError('registry: configProxy not found')
        return new SetMaxHealthAfterLiqSubAction(guardian, {
          config: registry.configProxy,
          maxHealthAfterLiqConfigs: newPoolParams.modeConfigs.map((modeConfig) => {
            return {
              mode: modeConfig.mode,
              maxHealthAfterLiqE18: modeConfig.config.maxHealthAfterLiqE18,
            }
          }),
        })
      },
      //set pool mode factor (if needed) (governor)
      (message: DeployLendingPoolSubActionMsg) => {
        // validate registry
        if (!registry.configProxy) throw new ValidateInputValueError('registry: configProxy not found')

        // map mode pool factors
        const modePoolFactors = newPoolParams.modeConfigs.map((modeConfig) => {
          return {
            mode: modeConfig.mode,
            poolFactors: [
              {
                pool: message.lendingPoolProxy,
                collFactor_e18: modeConfig.poolConfig.collFactorE18,
                borrFactor_e18: modeConfig.poolConfig.borrFactorE18,
              },
            ],
          }
        })

        return new SetModePoolFactorsSubAction(governor, {
          config: registry.configProxy,
          modePoolFactors: modePoolFactors,
        })
      },
      // 8. set mode status(guardian)
      () => {
        // validate registry
        if (!registry.configProxy) throw new ValidateInputValueError('registry: configProxy not found')
        const modeStatuses = newPoolParams.modeConfigs.map((modeConfig) => {
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
        if (!registry.riskManagerProxy) throw new ValidateInputValueError('registry: riskManagerProxy not found')

        const modeDebtCeilingInfos = newPoolParams.modeConfigs.map((modeConfig) => {
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

  protected getSubActions(registry: InitCapitalRegistry): ((message: any) => SubAction)[] {
    const subActions = []
    for (const pool of this.data.params.pools) {
      const poolSubAction = this.newPoolSubActions(registry, pool)
      subActions.push(...poolSubAction)
    }
    return subActions
  }
}
