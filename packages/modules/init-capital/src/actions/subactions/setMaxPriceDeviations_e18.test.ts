import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { SetMaxPriceDeviations_e18SubAction, SetMaxPriceDeviations_e18SubActionParams } from '@actions/subactions/setMaxPriceDeviations_e18'
import { SetMaxPriceDeviations_e18TxBuilder } from '@actions/subactions/tx-builders/InitOracle/setMaxPriceDeviations_e18'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

class TestSetMaxPriceDeviations_e18SubAction extends SetMaxPriceDeviations_e18SubAction {
  public override setTxBuilders(): void {
    super.setTxBuilders()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetMaxPriceDeviations_e18SubAction', async () => {
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test correct calldata', async () => {
    const params: SetMaxPriceDeviations_e18SubActionParams = {
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
    }
    const SetMaxPriceDeviations_e18SubAction = new TestSetMaxPriceDeviations_e18SubAction(client, params)

    for (let i = 0; i < SetMaxPriceDeviations_e18SubAction.txBuilders.length; i++) {
      const txBuilder = SetMaxPriceDeviations_e18SubAction.txBuilders[i] as SetMaxPriceDeviations_e18TxBuilder
      const tokenMaxPriceDeviationsParams = params.tokenMaxPriceDeviations
      for (let k = 0; k < txBuilder.tokens.length; k++) {
        expect(txBuilder.tokens[k]).toStrictEqual(tokenMaxPriceDeviationsParams[k].token)
        expect(txBuilder.maxPriceDeviations_e18s[k]).toStrictEqual(tokenMaxPriceDeviationsParams[k].maxPriceDeviation_e18)
      }
    }
  })
})
