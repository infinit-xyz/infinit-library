import _ from 'lodash'
import { beforeAll, describe, expect, test } from 'vitest'

import { parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { SubAction } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY, ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'
import { SetInitOracleSourcesAction, SetInitOracleSourcesActionData, SetInitOracleSourcesActionParams } from '@actions/setInitOracleSources'
import { SetModeAndTokenLiqMultiplierSubAction } from '@actions/subactions/setModeAndTokenLiqMultiplier'

import { ARBITRUM_TEST_ADDRESSES } from './__mock__/address'
import { InitCapitalRegistry } from '@/src/type'
import { TestChain } from '@infinit-xyz/test'
import { TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

class AddNewModesActionTest extends SetInitOracleSourcesAction {
  public override getSubActions(registry: InitCapitalRegistry): SubAction[] {
    return super.getSubActions(registry)
  }
}

describe('SetInitOracleSources', async () => {
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

  test('set init Oracle Sources Action', async () => {
    const setInitOracleSourcesActionParams: SetInitOracleSourcesActionParams = {
      token: ARBITRUM_TEST_ADDRESSES.usdc,
      oracleConfig: {
        primarySource: {
          type: 'api3',
          params: {
            dataFeedProxy: '0xD3C586Eec1C6C3eC41D276a23944dea080eDCf7f',
            maxStaleTime: 86400n,
          },
        },
        secondarySource: {
          type: 'pyth',
          params: {
            priceFeed: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
            maxStaleTime: 86400n,
          },
        },
        maxPriceDeviationE18: parseUnits('1.1', 18),
      },
    }
    const action = new SetInitOracleSourcesAction({
      signer: { governor: governor },
      params: setInitOracleSourcesActionParams,
    })
    await action.run(registry)
  })

  test('test correct name', async () => {
    expect(SetInitOracleSourcesAction.name).toStrictEqual('SetInitOracleSourcesAction')
  })
})
