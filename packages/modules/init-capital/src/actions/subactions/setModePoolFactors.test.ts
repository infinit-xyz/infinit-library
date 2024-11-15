import _ from 'lodash'
import { describe, expect, test } from 'vitest'

import { parseUnits } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetModePoolFactorsSubAction, SetModePoolFactorsSubActionParams } from '@actions/subactions/setModePoolFactors'

import { SetBorrFactorE18TxBuilder } from './tx-builders/Config/setBorrFactors_e18'
import { SetCollFactorE18TxBuilder } from './tx-builders/Config/setCollFactors_e18'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetModePoolFactorsSubAction extends SetModePoolFactorsSubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetPoolConfigSubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  test('test correct name', async () => {
    expect(SetModePoolFactorsSubAction.name).toStrictEqual('SetModePoolFactorsSubAction')
  })

  test('test correct calldata', async () => {
    const params: SetModePoolFactorsSubActionParams = {
      config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
      modePoolFactors: [
        {
          mode: 1,
          poolFactors: [
            {
              pool: '0x0000000000000000000000000000000000000001',
              collFactor_e18: parseUnits('0.9', 18),
              borrFactor_e18: parseUnits('1.1', 18),
            },
            {
              pool: '0x0000000000000000000000000000000000000002',
              collFactor_e18: parseUnits('0.9', 18),
              borrFactor_e18: parseUnits('1.1', 18),
            },
          ],
        },
        {
          mode: 2,
          poolFactors: [
            {
              pool: '0x0000000000000000000000000000000000000001',
              collFactor_e18: parseUnits('0.8', 18),
              borrFactor_e18: parseUnits('1.2', 18),
            },
          ],
        },
      ],
    }
    const pools = params.modePoolFactors.map((modePoolFactor) => modePoolFactor.poolFactors.map((poolFactor) => poolFactor.pool))
    const collFactors = params.modePoolFactors.map((modePoolFactor) =>
      modePoolFactor.poolFactors.map((poolFactor) => poolFactor.collFactor_e18),
    )
    const borrFactors = params.modePoolFactors.map((modePoolFactor) =>
      modePoolFactor.poolFactors.map((poolFactor) => poolFactor.borrFactor_e18),
    )
    const modes = params.modePoolFactors.map((modePoolFactor) => modePoolFactor.mode)

    const setPoolConfigSubAction = new TestSetModePoolFactorsSubAction(client, params)
    const setPoolConfigSubActionTxBuilders = setPoolConfigSubAction.txBuilders

    // 1 modePoolFactors contains 2 txbuilders
    expect(setPoolConfigSubActionTxBuilders.length === params.modePoolFactors.length * 2).toBeTruthy()

    // loop though modes and check if the txbuilders are correct
    // NOTE: 1 modes consist of 2 txBuilders(setColl, setBorr)
    for (let i = 0; i < pools.length; i++) {
      const collTxBuilder = setPoolConfigSubActionTxBuilders[i * 2] as SetCollFactorE18TxBuilder
      // check collTxBuilder mode
      expect(collTxBuilder.mode === modes[i]).toBeTruthy()
      // check collateral factors and pools
      expect(_.isEqual(collTxBuilder.pools, pools[i])).toBeTruthy()
      expect(_.isEqual(collTxBuilder.factors_e18, collFactors[i])).toBeTruthy()
      const borrTxBuilder = setPoolConfigSubActionTxBuilders[i * 2 + 1] as SetBorrFactorE18TxBuilder
      // check borrTxBuilder mode
      expect(borrTxBuilder.mode === modes[i]).toBeTruthy()
      // check borrow factors and pools
      expect(_.isEqual(borrTxBuilder.pools, pools[i])).toBeTruthy()
      expect(_.isEqual(borrTxBuilder.factors_e18, borrFactors[i])).toBeTruthy()
    }
  })
})
