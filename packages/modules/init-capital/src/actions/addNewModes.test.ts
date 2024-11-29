import { beforeAll, describe, expect, test } from 'vitest'

import { parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { SubAction } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'

import { AddNewModeAction } from './addNewModes'
// import { SetModeStatusSubAction } from './subactions/setModeStatus'
// import { ModeStatus, SetModeStatusTxBuilder } from './subactions/tx-builders/Config/setModeStatus'
import { InitCapitalRegistry } from '@/src/type'
import { TestChain } from '@infinit-xyz/test'
import { TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

class AddNewModesActionTest extends AddNewModeAction {
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
    registry = await setupInitCapital()
  })

  test('add new mode action', async () => {
    const addNewModeActionParams = {
      modes: [
        {
          mode: 1,
          modeStatus: {
            canCollateralize: true,
            canDecollateralize: false,
            canBorrow: true,
            canRepay: false,
          },
          liqIncentiveMultiplierE18: parseUnits('1.1', 18),
          minLiqIncentiveMultiplierE18: parseUnits('1.1', 18),
          maxHealthAfterLiqE18: parseUnits('1.1', 18),
        },
        {
          mode: 2,
          modeStatus: {
            canCollateralize: true,
            canDecollateralize: false,
            canBorrow: true,
            canRepay: false,
          },
          liqIncentiveMultiplierE18: parseUnits('1.1', 18),
          minLiqIncentiveMultiplierE18: parseUnits('1.1', 18),
          maxHealthAfterLiqE18: parseUnits('1.2', 18),
        },
      ],
    }
    const action = new AddNewModeAction({
      signer: { governor: governor, guardian: guardian },
      params: addNewModeActionParams,
    })
    await action.run(registry)

    // validate
    const [configArtifact, liqIncentiveCalculatorArtifact] = await Promise.all([
      readArtifact('Config'),
      readArtifact('LiqIncentiveCalculator'),
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
    }
    //
  })

  test('test correct name', async () => {
    expect(AddNewModeAction.name).toStrictEqual('AddNewModeAction')
  })

  // test('test correct calldata', async () => {
  //   const data: AddNewModeActionData = {
  //     params: {
  //       modes: [
  //         {
  //           mode: 1,
  //           modeStatus: {
  //             canCollateralize: true,
  //             canDecollateralize: true,
  //             canBorrow: true,
  //             canRepay: true,
  //           },
  //           liqIncentiveMultiplierE18: parseUnits('1.1', 18),
  //           minLiqIncentiveMultiplierE18: parseUnits('1.1', 18),
  //           maxHealthAfterLiqE18: parseUnits('1.1', 18),
  //         },
  //         {
  //           mode: 2,
  //           modeStatus: {
  //             canCollateralize: true,
  //             canDecollateralize: true,
  //             canBorrow: true,
  //             canRepay: true,
  //           },
  //           liqIncentiveMultiplierE18: parseUnits('1.1', 18),
  //           minLiqIncentiveMultiplierE18: parseUnits('1.1', 18),
  //           maxHealthAfterLiqE18: parseUnits('1.2', 18),
  //         },
  //       ],
  //     },
  //     signer: { governor: governor, guardian: guardian },
  //   }
  //   // data.
  //   const addNewModeAction = new AddNewModesActionTest(data)
  // })
})
