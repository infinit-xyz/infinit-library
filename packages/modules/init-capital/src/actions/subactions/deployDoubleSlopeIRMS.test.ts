import { beforeAll, describe, expect, test, vi } from 'vitest'

import { zeroAddress } from 'viem'

import { SubActionExecuteResponse } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import {
  DeployDoubleSlopeIRMSubActionMsg,
  DeployDoubleSlopeIRMsSubAction,
  DeployDoubleSlopeIRMsSubActionParams,
} from '@actions/subactions/deployDoubleSlopeIRMs'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployDoubleSlopeIRMsSubAction', () => {
  const registry: InitCapitalRegistry = {}
  let subAction: DeployDoubleSlopeIRMsSubAction
  let client: TestInfinitWallet
  let result: SubActionExecuteResponse<InitCapitalRegistry, DeployDoubleSlopeIRMSubActionMsg>

  const tester = ARBITRUM_TEST_ADDRESSES.tester
  const params: DeployDoubleSlopeIRMsSubActionParams = {
    doubleSlopeIRMConfigs: [
      {
        name: 'testIRM1',
        params: {
          baseBorrowRateE18: 100000000000000000n,
          jumpUtilizationRateE18: 800000000000000000n,
          borrowRateMultiplierE18: 10000000000000000n,
          jumpRateMultiplierE18: 10000000000000000n,
        },
      },
      {
        name: 'testIRM2',
        params: {
          baseBorrowRateE18: 100000000000000000n,
          jumpUtilizationRateE18: 800000000000000000n,
          borrowRateMultiplierE18: 10000000000000000n,
          jumpRateMultiplierE18: 10000000000000000n,
        },
      },
    ],
  }

  beforeAll(async () => {
    client = new TestInfinitWallet(TestChain.arbitrum, tester)
    subAction = new DeployDoubleSlopeIRMsSubAction(client, params)
    const callback = vi.fn()
    result = await subAction.execute(registry, {}, callback)
    expect(result.newRegistry.irms).toBeDefined()
    expect(result.newMessage?.doubleSlopeIrms).toBeDefined()
  })

  test('registry irms should not be zero address and unique', async () => {
    const registryIrms = result.newRegistry.irms!
    // check no zero address
    expect(registryIrms.testIRM1).not.to.equal(zeroAddress)
    expect(registryIrms.testIRM2).not.to.equal(zeroAddress)

    // check unique of the irms addresses
    const irmsSize = new Set(Object.values(registryIrms)).size
    expect(irmsSize).to.equal(params.doubleSlopeIRMConfigs.length)
  })

  test('message irms should not be zero address', async () => {
    const messagesIrms = result.newMessage!.doubleSlopeIrms!
    // check messages
    expect(messagesIrms.testIRM1).not.to.equal(zeroAddress)
    expect(messagesIrms.testIRM2).not.to.equal(zeroAddress)
    // check unique of the irms addresses
    const irmsSize = new Set(Object.values(messagesIrms)).size
    expect(irmsSize).to.equal(params.doubleSlopeIRMConfigs.length)
  })

  test('registry and message irms should be matched', async () => {
    const registryIrms = result.newRegistry.irms!
    const messagesIrms = result.newMessage!.doubleSlopeIrms!
    // registry and message addresses should be matched
    expect(registryIrms.testIRM1, messagesIrms.testIRM1).toBeTruthy()
    expect(registryIrms.testIRM2, messagesIrms.testIRM2).toBeTruthy()
  })
})
