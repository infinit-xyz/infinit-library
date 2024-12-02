import _ from 'lodash'
import { beforeAll, describe, expect, test } from 'vitest'

import { parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { SubAction } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { setupInitCapitalAndPools } from '@actions/__mock__/setup'
import { AddNewModesAction, AddNewModesActionData, AddNewModesActionParams } from '@actions/addNewModes'
import { SetMaxHealthAfterLiqSubAction } from '@actions/subactions/setMaxHealthAfterLiq'
import { SetModeAndTokenLiqMultiplierSubAction } from '@actions/subactions/setModeAndTokenLiqMultiplier'
import { SetModeDebtCeilingInfosSubAction } from '@actions/subactions/setModeDebtCeilingInfos'
import { SetModePoolFactorsSubAction } from '@actions/subactions/setModePoolFactors'
import { SetModeStatusSubAction } from '@actions/subactions/setModeStatus'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain } from '@infinit-xyz/test'
import { TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

class AddNewModesActionTest extends AddNewModesAction {
  public override getSubActions(registry: InitCapitalRegistry): SubAction[] {
    return super.getSubActions(registry)
  }
}

describe('Add New Mode', async () => {
  let guardian: TestInfinitWallet
  let governor: TestInfinitWallet
  let registry: InitCapitalRegistry

  beforeAll(async () => {
    const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
    const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
    guardian = new TestInfinitWallet(TestChain.arbitrum, account1.address)
    governor = new TestInfinitWallet(TestChain.arbitrum, account2.address)
    registry = await setupInitCapitalAndPools()
  })

  test('add new mode action', async () => {
    const addNewModeActionParams: AddNewModesActionParams = {
      modes: [
        {
          mode: 6,
          status: {
            canCollateralize: true,
            canDecollateralize: false,
            canBorrow: true,
            canRepay: false,
          },
          liqIncentiveMultiplierE18: parseUnits('1.1', 18),
          minLiqIncentiveMultiplierE18: parseUnits('1.1', 18),
          maxHealthAfterLiqE18: parseUnits('1.1', 18),
          pools: [
            {
              address: registry.lendingPools!['INIT Ether'].lendingPool,
              collFactorE18: parseUnits('0.8', 18),
              borrFactorE18: parseUnits('1.1', 18),
              debtCeiling: parseUnits('1000000', 18),
            },
            {
              address: registry.lendingPools!['INIT USDT'].lendingPool,
              collFactorE18: parseUnits('0.9', 18),
              borrFactorE18: parseUnits('1.2', 18),
              debtCeiling: parseUnits('1000001', 18),
            },
          ],
        },
      ],
    }
    const action = new AddNewModesAction({
      signer: { governor: governor, guardian: guardian },
      params: addNewModeActionParams,
    })
    await action.run(registry)

    // validate
    const [configArtifact, liqIncentiveCalculatorArtifact, riskManagerArtifact] = await Promise.all([
      readArtifact('Config'),
      readArtifact('LiqIncentiveCalculator'),
      readArtifact('RiskManager'),
    ])
    const modes = addNewModeActionParams.modes
    for (let i = 0; i < modes.length; i++) {
      // check mode status
      const onChainConfig = await guardian.publicClient.readContract({
        address: registry.configProxy!,
        abi: configArtifact.abi,
        functionName: 'getModeStatus',
        args: [modes[i].mode],
      })
      expect(onChainConfig.canCollateralize).toStrictEqual(true)
      expect(onChainConfig.canDecollateralize).toStrictEqual(false)
      expect(onChainConfig.canBorrow).toStrictEqual(true)
      expect(onChainConfig.canRepay).toStrictEqual(false)

      // check max health after liq
      const maxHealth = await guardian.publicClient.readContract({
        address: registry.configProxy!,
        abi: configArtifact.abi,
        functionName: 'getMaxHealthAfterLiq_e18',
        args: [modes[i].mode],
      })
      expect(maxHealth).toStrictEqual(modes[i].maxHealthAfterLiqE18)
      // check liq incentive and max health after liq
      const minLiqIncentiveMultiplier = await guardian.publicClient.readContract({
        address: registry.liqIncentiveCalculatorProxy!,
        abi: liqIncentiveCalculatorArtifact.abi,
        functionName: 'minLiqIncentiveMultiplier_e18',
        args: [modes[i].mode],
      })
      const modeLiqIncentiveMultiplier = await guardian.publicClient.readContract({
        address: registry.liqIncentiveCalculatorProxy!,
        abi: liqIncentiveCalculatorArtifact.abi,
        functionName: 'modeLiqIncentiveMultiplier_e18',
        args: [modes[i].mode],
      })
      expect(modeLiqIncentiveMultiplier).toStrictEqual(modes[i].liqIncentiveMultiplierE18)
      expect(minLiqIncentiveMultiplier).toStrictEqual(modes[i].minLiqIncentiveMultiplierE18)

      // check pool factors
      for (const pool of modes[i].pools) {
        const { collFactor_e18, borrFactor_e18 } = await guardian.publicClient.readContract({
          address: registry.configProxy!,
          abi: configArtifact.abi,
          functionName: 'getTokenFactors',
          args: [modes[i].mode, pool.address],
        })
        expect(collFactor_e18).toStrictEqual(pool.collFactorE18)
        expect(borrFactor_e18).toStrictEqual(pool.borrFactorE18)
      }

      // check debt ceiling
      for (const pool of modes[i].pools) {
        const modeDebtCeilingAmt = await guardian.publicClient.readContract({
          address: registry.riskManagerProxy!,
          abi: riskManagerArtifact.abi,
          functionName: 'getModeDebtCeilingAmt',
          args: [modes[i].mode, pool.address],
        })
        expect(modeDebtCeilingAmt).toStrictEqual(pool.debtCeiling)
      }
    }
  })

  test('test correct name', async () => {
    expect(AddNewModesAction.name).toStrictEqual('AddNewModesAction')
  })

  test('test correct calldata', async () => {
    const data: AddNewModesActionData = {
      params: {
        modes: [
          {
            mode: 6,
            status: {
              canCollateralize: true,
              canDecollateralize: false,
              canBorrow: true,
              canRepay: false,
            },
            liqIncentiveMultiplierE18: parseUnits('1.1', 18),
            minLiqIncentiveMultiplierE18: parseUnits('1.1', 18),
            maxHealthAfterLiqE18: parseUnits('1.1', 18),
            pools: [
              {
                address: registry.lendingPools!['INIT Ether'].lendingPool,
                collFactorE18: parseUnits('0.8', 18),
                borrFactorE18: parseUnits('1.1', 18),
                debtCeiling: parseUnits('1000000', 18),
              },
            ],
          },
        ],
      },
      signer: { governor: governor, guardian: guardian },
    }
    // data.
    const addNewModeAction = new AddNewModesActionTest(data)
    const subActions = addNewModeAction.getSubActions(registry)

    // subactions should be length of 3
    expect(subActions.length).toStrictEqual(5)

    // setModeStatus subaction params should be correct
    const setModeStatusSubAction = subActions[0] as SetModeStatusSubAction
    expect(
      _.isEqual(
        setModeStatusSubAction.params.modeStatus,
        data.params.modes.map((mode) => {
          return {
            mode: mode.mode,
            status: mode.status,
          }
        }),
      ),
    ).toBeTruthy()

    // setMaxHealthAfterLiq subaction params should be correct
    const setMaxHealthAfterLiqSubAction = subActions[1] as SetMaxHealthAfterLiqSubAction
    expect(
      _.isEqual(
        setMaxHealthAfterLiqSubAction.params.maxHealthAfterLiqConfigs,
        data.params.modes.map((mode) => {
          return {
            mode: mode.mode,
            maxHealthAfterLiqE18: mode.maxHealthAfterLiqE18,
          }
        }),
      ),
    ).toBeTruthy()

    // SetModeAndTokenLiqMultiplier subAction params should be correct
    const setModeAndTokenLiqMultiplierSubAction = subActions[2] as SetModeAndTokenLiqMultiplierSubAction
    expect(
      _.isEqual(
        setModeAndTokenLiqMultiplierSubAction.params.modeLiqIncentiveMultiplierConfigs,
        data.params.modes.map((mode) => {
          return {
            mode: mode.mode,
            config: {
              liqIncentiveMultiplier_e18: mode.liqIncentiveMultiplierE18,
              minLiqIncentiveMultiplier_e18: mode.minLiqIncentiveMultiplierE18,
            },
          }
        }),
      ),
    ).toBeTruthy()

    // SetModeDebtCeilingInfos subAction params should be correct
    const setModeDebtCeilingInfosSubAction = subActions[3] as SetModeDebtCeilingInfosSubAction
    expect(
      _.isEqual(
        setModeDebtCeilingInfosSubAction.params.modeDebtCeilingInfos,
        data.params.modes.map((mode) => {
          return {
            mode: mode.mode,
            pools: mode.pools.map((pool) => pool.address),
            ceilAmts: mode.pools.map((pool) => pool.debtCeiling),
          }
        }),
      ),
    ).toBeTruthy()

    // SetModePoolFactors subAction params should be correct
    const setModePoolFactorsSubAction = subActions[4] as SetModePoolFactorsSubAction
    expect(
      _.isEqual(
        setModePoolFactorsSubAction.params.modePoolFactors,
        data.params.modes.map((mode) => {
          return {
            mode: mode.mode,
            poolFactors: mode.pools.map((pool) => {
              return {
                pool: pool.address,
                collFactor_e18: pool.collFactorE18,
                borrFactor_e18: pool.borrFactorE18,
              }
            }),
          }
        }),
      ),
    ).toBeTruthy()
  })
})
