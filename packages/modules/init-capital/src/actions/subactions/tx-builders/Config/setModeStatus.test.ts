import { beforeAll, describe, expect, test } from 'vitest'

import { Address, encodeFunctionData, getAddress } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupInitCapital } from '@actions/__mock__/setup'

import { SetModeStatusTxBuilder } from './setModeStatus'
import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetModeStatus', async () => {
  let registry: InitCapitalRegistry
  let txBuilder: SetModeStatusTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)
  let configProxy: Address

  beforeAll(async () => {
    registry = await setupInitCapital()
    if (!registry.configProxy) throw new Error('configProxy is not found in registry')
    configProxy = getAddress(registry.configProxy)
  })

  test("test tx builder's calldata should be matched with mock data", async () => {
    txBuilder = new SetModeStatusTxBuilder(client, {
      config: configProxy,
      mode: 1,
      status: {
        canCollateralize: true,
        canDecollateralize: false,
        canBorrow: true,
        canRepay: false,
      },
    })
    const txData = await txBuilder.buildTx()

    const configArtifact = await readArtifact('Config')

    const mockTxData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setModeStatus',
      args: [
        1,
        {
          canCollateralize: true,
          canDecollateralize: false,
          canBorrow: true,
          canRepay: false,
        },
      ],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect(configProxy === txData.to).toBeTruthy()
  })
  test('test validate should be passed', async () => {
    expect(registry.configProxy).toBeTruthy()
    txBuilder = new SetModeStatusTxBuilder(client, {
      config: configProxy,
      mode: 1,
      status: {
        canCollateralize: true,
        canDecollateralize: false,
        canBorrow: true,
        canRepay: false,
      },
    })
    expect(txBuilder.validate()).resolves.not.toThrow()
  })
})
