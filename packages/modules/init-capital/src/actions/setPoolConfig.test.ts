import { beforeAll, describe, expect, test } from 'vitest'

import { Address, privateKeyToAccount } from 'viem/accounts'

import { SubAction } from '@infinit-xyz/core'

import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'
import { SetPoolConfigAction, SetPoolConfigActionData } from '@actions/setPoolConfig'
import { SetPoolConfigSubAction } from '@actions/subactions/setPoolConfig'
import { PoolConfig, SetPoolConfigTxBuilder } from '@actions/subactions/tx-builders/Config/setPoolConfig'

import { InitCapitalRegistry } from '@/src/type'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

class SetPoolConfigActionTest extends SetPoolConfigAction {
  public override getSubActions(): SubAction[] {
    return super.getSubActions()
  }
}

describe('SetPoolConfig', async () => {
  let registry: InitCapitalRegistry
  const account = privateKeyToAccount(ANVIL_PRIVATE_KEY)
  const client = new TestInfinitWallet(TestChain.arbitrum, account.address)

  // note: the pool address is not real
  // which we can use to test since we only need to check that poolConfig is set correctly
  const poolConfigParams = [
    {
      pool: '0x2a9bDCFF37aB68B95A53435ADFd8892e86084F93' as Address,
      poolConfig: {
        supplyCap: 12345n,
        borrowCap: 9999n,
        canMint: false,
        canBurn: false,
        canBorrow: false,
        canRepay: false,
        canFlash: false,
      },
    },
    {
      pool: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5' as Address,
      poolConfig: {
        supplyCap: 8888n,
        borrowCap: 2222n,
        canMint: true,
        canBurn: true,
        canBorrow: true,
        canRepay: false,
        canFlash: false,
      },
    },
  ]

  beforeAll(async () => {
    registry = await setupInitCapital()
  })

  test('test correct name', async () => {
    expect(SetPoolConfigAction.name).toStrictEqual('SetPoolConfigAction')
  })

  test('test correct calldata', async () => {
    const data: SetPoolConfigActionData = {
      signer: { guardian: client },
      params: {
        config: registry.configProxy!,
        batchPoolConfigParams: poolConfigParams,
      },
    }
    // data.
    const setPoolConfigAction = new SetPoolConfigActionTest(data)
    const subActions: SetPoolConfigSubAction[] = setPoolConfigAction.getSubActions() as SetPoolConfigSubAction[]
    expect(subActions[0].params.config).toStrictEqual(data.params.config)

    for (let j = 0; j < subActions.length; j++) {
      for (let i = 0; i < subActions[j].txBuilders.length; i++) {
        const txBuilder = subActions[j].txBuilders[i] as SetPoolConfigTxBuilder
        const mockTxBuilder = data.params.batchPoolConfigParams[i]
        expect(txBuilder.pool === mockTxBuilder.pool).toBeTruthy()

        Object.keys(txBuilder.poolConfig).forEach((key) => {
          const poolConfigKey = key as keyof PoolConfig
          expect(txBuilder.poolConfig[poolConfigKey] === mockTxBuilder.poolConfig[poolConfigKey]).toBeTruthy()
        })
      }
    }
  })

  test('set pool config', async () => {
    const action = new SetPoolConfigAction({
      params: {
        config: registry.configProxy!,
        batchPoolConfigParams: poolConfigParams,
      },
      signer: { guardian: client },
    })
    await action.run(registry)
    const configArtifact = await readArtifact('Config')
    // check that the pool config is set correctly
    for (let i = 0; i < poolConfigParams.length; i++) {
      const onChainPoolConfig = await client.publicClient.readContract({
        address: registry.configProxy!,
        abi: configArtifact.abi,
        functionName: 'getPoolConfig',
        args: [poolConfigParams[i].pool],
      })
      expect(onChainPoolConfig.supplyCap).toStrictEqual(poolConfigParams[i].poolConfig.supplyCap)
      expect(onChainPoolConfig.borrowCap).toStrictEqual(poolConfigParams[i].poolConfig.borrowCap)
      expect(onChainPoolConfig.canMint).toStrictEqual(poolConfigParams[i].poolConfig.canMint)
      expect(onChainPoolConfig.canBurn).toStrictEqual(poolConfigParams[i].poolConfig.canBurn)
      expect(onChainPoolConfig.canBorrow).toStrictEqual(poolConfigParams[i].poolConfig.canBorrow)
      expect(onChainPoolConfig.canRepay).toStrictEqual(poolConfigParams[i].poolConfig.canRepay)
      expect(onChainPoolConfig.canFlash).toStrictEqual(poolConfigParams[i].poolConfig.canFlash)
    }
  })
})
