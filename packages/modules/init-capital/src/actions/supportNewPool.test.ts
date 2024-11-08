import { beforeAll, describe, expect, test } from 'vitest'

import { parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'

import { ARBITRUM_TEST_ADDRESSES } from './__mock__/address'
import { SupportNewPoolAction, SupportNewPoolActionParams } from './supportNewPool'
// import { ModeStatus, SetModeStatusTxBuilder } from './subactions/tx-builders/Config/setModeStatus'
import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// class SupportNewPoolActionTest extends SupportNewPoolAction {
// public override getSubActions(): SubAction[] {
//   return super.getSubActions()
// }
// }

describe('SupportNewPoolTest', async () => {
  // let client: InfinitWallet
  let registry: InitCapitalRegistry
  const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
  const account2 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
  const client1 = new TestInfinitWallet(TestChain.arbitrum, account1.address)
  const client2 = new TestInfinitWallet(TestChain.arbitrum, account2.address)

  beforeAll(async () => {
    registry = await setupInitCapital()
  })

  test('support new pool', async () => {
    const actionParams: SupportNewPoolActionParams = {
      name: 'test_new_pool',
      token: ARBITRUM_TEST_ADDRESSES.weth,
      modeConfigs: [
        {
          mode: 1,
          poolConfig: {
            collFactorE18: parseUnits('0.8', 18),
            borrFactorE18: parseUnits('1.1', 18),
            debtCeiling: parseUnits('1000000', 18),
          },
          config: {
            liqIncentiveMultiplier_e18: parseUnits('1.1', 18),
            minLiqIncentiveMultiplier_e18: parseUnits('1.1', 18),
          },
        },
        {
          mode: 2,
          poolConfig: {
            collFactorE18: parseUnits('0.8', 18),
            borrFactorE18: parseUnits('1.1', 18),
            debtCeiling: parseUnits('1000000', 18),
          },
          config: {
            liqIncentiveMultiplier_e18: parseUnits('1.1', 18),
            minLiqIncentiveMultiplier_e18: parseUnits('1.1', 18),
          },
        },
      ],
      oracleConfig: {
        primarySource: {
          type: 'api3',
          params: {
            dataFeedProxy: '0xf624881ac131210716F7708C28403cCBe346cB73',
            maxStaleTime: 86400n,
          },
        },
      },
      liqcentiveMultiplier_e18: parseUnits('1.1', 18),
      supplyCap: parseUnits('1000000', 18),
      borrowCap: parseUnits('1000000', 18),
      reserveFactor: parseUnits('0.1', 18),
      treasury: ARBITRUM_TEST_ADDRESSES.oneAddress,
      doubleSlopeIRMConfig: {
        name: 'testIRM',
        params: {
          baseBorrowRateE18: 100000000000000000n,
          jumpUtilizationRateE18: 800000000000000000n,
          borrowRateMultiplierE18: 10000000000000000n,
          jumpRateMultiplierE18: 10000000000000000n,
        },
      },
    }

    const action = new SupportNewPoolAction({
      params: actionParams,
      signer: { deployer: client1, guardian: client1, governor: client2 },
    })
    await action.run(registry)

    // validation
    const configArtifact = await readArtifact('Config')
    // check mode status
    const modes = actionParams.modeConfigs.map((modeConfig) => modeConfig.mode)
    for (let i = 0; i < modes.length; i++) {
      const mode = modes[i]
      const onChainConfig = await client1.publicClient.readContract({
        address: registry.configProxy!,
        abi: configArtifact.abi,
        functionName: 'getModeStatus',
        args: [mode],
      })
      expect(onChainConfig.canCollateralize).toStrictEqual(true)
      expect(onChainConfig.canDecollateralize).toStrictEqual(true)
      expect(onChainConfig.canBorrow).toStrictEqual(true)
      expect(onChainConfig.canRepay).toStrictEqual(true)
    }
  })
})
