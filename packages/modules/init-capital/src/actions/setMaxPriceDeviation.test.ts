import { describe, expect, test } from 'vitest'

import { SubAction } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetMaxPriceDeviationAction, SetMaxPriceDeviationActionData } from '@actions/setMaxPriceDeviation'
import { SetMaxPriceDeviations_e18SubAction } from '@actions/subactions/setMaxPriceDeviations_e18'
import { SetMaxPriceDeviations_e18TxBuilder } from '@actions/subactions/tx-builders/InitOracle/setMaxPriceDeviations_e18'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class SetMaxPriceDeviationActionTest extends SetMaxPriceDeviationAction {
  public override getSubActions(): SubAction[] {
    return super.getSubActions()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetMaxPriceDeviation', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  test('test correct name', async () => {
    expect(SetMaxPriceDeviationAction.name).toStrictEqual('SetMaxPriceDeviationAction')
  })
  test('test correct calldata', async () => {
    const data: SetMaxPriceDeviationActionData = {
      signer: { governor: client },
      params: {
        initOracle: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
        tokenMaxPriceDeviations: [
          {
            token: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
            maxPriceDeviation_e18: BigInt(12345),
          },
          {
            token: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
            maxPriceDeviation_e18: BigInt(8888),
          },
        ],
      },
    }
    // data.
    const SetMaxPriceDeviationAction = new SetMaxPriceDeviationActionTest(data)
    const subActions: SetMaxPriceDeviations_e18SubAction[] =
      SetMaxPriceDeviationAction.getSubActions() as SetMaxPriceDeviations_e18SubAction[]
    expect(subActions[0].params.initOracle).toStrictEqual(data.params.initOracle)

    for (let j = 0; j < subActions.length; j++) {
      for (let i = 0; i < subActions[j].txBuilders.length; i++) {
        const txBuilder = subActions[j].txBuilders[i] as SetMaxPriceDeviations_e18TxBuilder
        const tokenMaxPriceDeviationsParams = data.params.tokenMaxPriceDeviations
        for (let k = 0; k < txBuilder.tokens.length; k++) {
          expect(txBuilder.tokens[k]).toStrictEqual(tokenMaxPriceDeviationsParams[k].token)
          expect(txBuilder.maxPriceDeviations_e18s[k]).toStrictEqual(tokenMaxPriceDeviationsParams[k].maxPriceDeviation_e18)
        }
      }
    }
  })
})