import { beforeAll, describe, expect, test } from 'vitest'

import { Address, encodeFunctionData, getAddress, maxUint128 } from 'viem'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'
import { setupInitCapital } from '@actions/__mock__/setup'
import { SetPoolConfigTxBuilder } from '@actions/subactions/tx-builders/Config/setPoolConfig'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

// anvil tester
const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetPoolConfigTxBuilder', async () => {
  let registry: InitCapitalRegistry
  let txBuilder: SetPoolConfigTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  let configProxy: Address

  beforeAll(async () => {
    registry = await setupInitCapital()
    if (!registry.configProxy) throw new Error('configProxy is not found in registry')
    configProxy = getAddress(registry.configProxy)
  })
  test("test tx builder's calldata should be matched with mock data", async () => {
    txBuilder = new SetPoolConfigTxBuilder(client, {
      config: configProxy,
      // NOTE: pool address is not real, just for testing
      pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
      poolConfig: {
        supplyCap: 12345n,
        borrowCap: 9999n,
        canMint: false,
        canBurn: false,
        canBorrow: false,
        canRepay: false,
        canFlash: false,
      },
    })
    const txData = await txBuilder.buildTx()

    const configArtifact = await readArtifact('Config')

    const mockTxData = encodeFunctionData({
      abi: configArtifact.abi,
      functionName: 'setPoolConfig',
      args: [
        // NOTE: pool address is not real, just for testing
        '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
        {
          supplyCap: 12345n,
          borrowCap: 9999n,
          canMint: false,
          canBurn: false,
          canBorrow: false,
          canRepay: false,
          canFlash: false,
        },
      ],
    })

    expect(mockTxData === txData.data).toBeTruthy()
    expect(configProxy === txData.to).toBeTruthy()
  })

  test('test supplyCap over maxUint128 should validate fail', async () => {
    txBuilder = new SetPoolConfigTxBuilder(client, {
      config: configProxy,
      // NOTE: pool address is not real, just for testing
      pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
      poolConfig: {
        supplyCap: maxUint128 + 1n,
        borrowCap: 9999n,
        canMint: false,
        canBurn: false,
        canBorrow: false,
        canRepay: false,
        canFlash: false,
      },
    })
    expect(txBuilder.validate()).rejects.toThrowError(
      `SupplyCap must be between 0 and 340282366920938463463374607431768211455)(maxUint128), found ${maxUint128 + 1n}`,
    )
  })

  test('test borrowCap over maxUint128 should validate fail', async () => {
    txBuilder = new SetPoolConfigTxBuilder(client, {
      config: configProxy,
      // NOTE: pool address is not real, just for testing
      pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
      poolConfig: {
        supplyCap: 100000n,
        borrowCap: maxUint128 + 1n,
        canMint: false,
        canBurn: false,
        canBorrow: false,
        canRepay: false,
        canFlash: false,
      },
    })
    expect(txBuilder.validate()).rejects.toThrowError(
      `BorrowCap must be between 0 and 340282366920938463463374607431768211455)(maxUint128), found ${maxUint128 + 1n}`,
    )
  })

  test('test validate should be passed', async () => {
    txBuilder = new SetPoolConfigTxBuilder(client, {
      config: configProxy,
      // NOTE: pool address is not real, just for testing
      pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93',
      poolConfig: {
        supplyCap: 12345n,
        borrowCap: 9999n,
        canMint: false,
        canBurn: false,
        canBorrow: false,
        canRepay: false,
        canFlash: false,
      },
    })
    expect(txBuilder.validate()).resolves.not.toThrow()
  })
})
