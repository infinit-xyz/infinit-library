import { beforeAll, describe, expect, test } from 'vitest'

import { privateKeyToAccount } from 'viem/accounts'

import { SubAction } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupInitCapital } from '@actions/__mock__/setup'
import { SetMaxPriceDeviationAction, SetMaxPriceDeviationActionData } from '@actions/setMaxPriceDeviation'
import { SetMaxPriceDeviations_e18SubAction } from '@actions/subactions/setMaxPriceDeviations_e18'
import { SetMaxPriceDeviations_e18TxBuilder } from '@actions/subactions/tx-builders/InitOracle/setMaxPriceDeviations_e18'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

class SetMaxPriceDeviationActionTest extends SetMaxPriceDeviationAction {
  public override getSubActions(): SubAction[] {
    return super.getSubActions()
  }
}

describe('SetMaxPriceDeviation', async () => {
  let registry: InitCapitalRegistry
  const account = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
  const client = new TestInfinitWallet(TestChain.arbitrum, account.address)

  const tokenMaxPriceDeviations = [
    {
      token: ARBITRUM_TEST_ADDRESSES.weth,
      maxPriceDeviation_e18: BigInt(102 * 10 ** 16),
    },
    {
      token: ARBITRUM_TEST_ADDRESSES.usdt,
      maxPriceDeviation_e18: BigInt(101 * 10 ** 16),
    },
  ]

  beforeAll(async () => {
    registry = await setupInitCapital()
  })

  test('test correct name', async () => {
    expect(SetMaxPriceDeviationAction.name).toStrictEqual('SetMaxPriceDeviationAction')
  })
  test('test correct calldata', async () => {
    const data: SetMaxPriceDeviationActionData = {
      signer: { governor: client },
      params: {
        initOracle: registry.initOracleProxy!,
        tokenMaxPriceDeviations: tokenMaxPriceDeviations,
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

  test('set price deviation', async () => {
    const action = new SetMaxPriceDeviationAction({
      signer: { governor: client },
      params: {
        initOracle: registry.initOracleProxy!,
        tokenMaxPriceDeviations: tokenMaxPriceDeviations,
      },
    })
    registry = await action.run(registry)
    // check onchain
    const initOracleArtifact = await readArtifact('InitOracle')
    for (let i = 0; i < tokenMaxPriceDeviations.length; i++) {
      const priceDeviation = await client.publicClient.readContract({
        address: registry.initOracleProxy!,
        abi: initOracleArtifact.abi,
        functionName: 'maxPriceDeviations_e18',
        args: [tokenMaxPriceDeviations[i].token],
      })
      expect(priceDeviation).toStrictEqual(tokenMaxPriceDeviations[i].maxPriceDeviation_e18)
    }
  })
})
