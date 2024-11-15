import { beforeAll, describe, expect, test } from 'vitest'

import { Address, privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'

import { InfinitWallet } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY_2 } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'
import { SetModeFactorsAction } from '@actions/setModeFactors'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, getForkRpcUrl } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('SetModeFactors', async () => {
  let client: InfinitWallet
  let registry: InitCapitalRegistry

  const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)

  beforeAll(async () => {
    const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY_2)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account1)
    registry = await setupInitCapital()
  })

  test('set all pool factors', async () => {
    const mode = 1
    // note: pool address is not real, we can use this for checking that factors are set correctly
    const poolFactors = [
      { pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93' as Address, borrFactor: 11n * 10n ** 17n, collFactor: 9n * 10n ** 17n },
      { pool: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5' as Address, borrFactor: 11n * 10n ** 17n, collFactor: 9n * 10n ** 17n },
    ]

    const action = new SetModeFactorsAction({
      params: {
        config: registry.configProxy!,
        mode: mode,
        poolFactors: poolFactors,
      },
      signer: { governor: client },
    })
    await action.run(registry)
    const configArtifact = await readArtifact('Config')
    // check mode status
    for (let i = 0; i < poolFactors.length; i++) {
      const poolFactor = poolFactors[i]
      const onChainFactors = await client.publicClient.readContract({
        address: registry.configProxy!,
        abi: configArtifact.abi,
        functionName: 'getTokenFactors',
        args: [mode, poolFactor.pool],
      })

      expect(onChainFactors.borrFactor_e18).toStrictEqual(poolFactor.borrFactor)
      expect(onChainFactors.collFactor_e18).toStrictEqual(poolFactor.collFactor)
    }
  })

  test('set only coll pool factors', async () => {
    const mode = 1
    // note: pool address is not real, we can use this for checking that factors are set correctly
    const poolFactors = [
      { pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93' as Address, collFactor: 9n * 10n ** 17n },
      { pool: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5' as Address, collFactor: 9n * 10n ** 17n },
    ]

    const action = new SetModeFactorsAction({
      params: {
        config: registry.configProxy!,
        mode: mode,
        poolFactors: poolFactors,
      },
      signer: { governor: client },
    })
    await action.run(registry)
    const configArtifact = await readArtifact('Config')
    // check mode status
    for (let i = 0; i < poolFactors.length; i++) {
      const poolFactor = poolFactors[i]
      const onChainFactors = await client.publicClient.readContract({
        address: registry.configProxy!,
        abi: configArtifact.abi,
        functionName: 'getTokenFactors',
        args: [mode, poolFactor.pool],
      })

      expect(onChainFactors.borrFactor_e18).toStrictEqual(0n)
      expect(onChainFactors.collFactor_e18).toStrictEqual(poolFactor.collFactor)
    }
  })

  test('set only borr pool factors', async () => {
    const mode = 1
    // note: pool address is not real, we can use this for checking that factors are set correctly
    const poolFactors = [
      { pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93' as Address, borrFactor: 11n * 10n ** 17n },
      { pool: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5' as Address, borrFactor: 11n * 10n ** 17n },
    ]

    const action = new SetModeFactorsAction({
      params: {
        config: registry.configProxy!,
        mode: mode,
        poolFactors: poolFactors,
      },
      signer: { governor: client },
    })
    await action.run(registry)
    const configArtifact = await readArtifact('Config')
    // check mode status
    for (let i = 0; i < poolFactors.length; i++) {
      const poolFactor = poolFactors[i]
      const onChainFactors = await client.publicClient.readContract({
        address: registry.configProxy!,
        abi: configArtifact.abi,
        functionName: 'getTokenFactors',
        args: [mode, poolFactor.pool],
      })

      expect(onChainFactors.borrFactor_e18).toStrictEqual(poolFactor.borrFactor)
      expect(onChainFactors.collFactor_e18).toStrictEqual(0n)
    }
  })

  test('test correct name', async () => {
    expect(SetModeFactorsAction.name).toStrictEqual('SetModeFactorsAction')
  })
})
