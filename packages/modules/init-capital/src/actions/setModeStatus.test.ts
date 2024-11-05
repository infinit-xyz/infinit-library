import { beforeAll, describe, expect, test } from 'vitest'

import { SubAction } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES } from '@actions/__mock__/address'

import { InitCapitalRegistry } from '@/src/type'
import { ANVIL_PRIVATE_KEY } from '@actions/__mock__/account'
import { setupInitCapital } from '@actions/__mock__/setup'
import { InfinitWallet } from '@infinit-xyz/core'
import { getForkRpcUrl, TestChain } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'
import { privateKeyToAccount } from 'viem/accounts'
import { arbitrum } from 'viem/chains'
import { SetModeStatusAction, SetModeStatusActionData } from './setModeStatus'
import { SetModeStatusSubAction } from './subactions/setModeStatus'
import { ModeStatus, SetModeStatusTxBuilder } from './subactions/tx-builders/Config/setModeStatus'


class SetModeStatusActionTest extends SetModeStatusAction {
  public override getSubActions(): SubAction[] {
    return super.getSubActions()
  }
}

const tester = ARBITRUM_TEST_ADDRESSES.tester
describe('SetModeStatus', async () => {
  let client: InfinitWallet
  let registry: InitCapitalRegistry

  const rpcEndpoint = getForkRpcUrl(TestChain.arbitrum)

  beforeAll(async () => {
    const account1 = privateKeyToAccount(ANVIL_PRIVATE_KEY)
    client = new InfinitWallet(arbitrum, rpcEndpoint, account1)
    registry = await setupInitCapital()
  })
  
  test('set all status to true', async () => {
    const modeStatus = [
      { mode: 1, status: { canCollateralize: true, canDecollateralize: true, canBorrow: true, canRepay: true } },
      { mode: 2, status: { canCollateralize: true, canDecollateralize: true, canBorrow: true, canRepay: true } },
    ]

    const action = new SetModeStatusAction({
      params: {
        config: registry.configProxy!,
        modeStatus: modeStatus,
      },
      signer: { guardian: client }
    })
    await action.run(registry)
    const configArtifact = await readArtifact('Config')
    // check mode status
    for (let i = 0; i < modeStatus.length; i++) {
      const mode = modeStatus[i]
      const onChainConfig = await client.publicClient.readContract({
        address: registry.configProxy!,
        abi: configArtifact.abi,
        functionName: 'getModeStatus',
        args: [mode.mode],
      })

      expect(onChainConfig.canCollateralize).toStrictEqual(true)
      expect(onChainConfig.canDecollateralize).toStrictEqual(true)
      expect(onChainConfig.canBorrow).toStrictEqual(true)
      expect(onChainConfig.canRepay).toStrictEqual(true)
    }
  })

  test('set all status from true to false', async () => {
    // set up all status to true
    const modeStatus = [
      { mode: 1, status: { canCollateralize: true, canDecollateralize: true, canBorrow: true, canRepay: true } },
      { mode: 2, status: { canCollateralize: true, canDecollateralize: true, canBorrow: true, canRepay: true } },
    ]

    let action = new SetModeStatusAction({
      params: {
        config: registry.configProxy!,
        modeStatus: modeStatus,
      },
      signer: { guardian: client }
    })
    await action.run(registry)
    // change all status to false
    for (let i = 0; i < modeStatus.length; i++) {
      modeStatus[i].status = { canCollateralize: false, canDecollateralize: false, canBorrow: false, canRepay: false }
    }
    action = new SetModeStatusAction({
      params: {
        config: registry.configProxy!,
        modeStatus: modeStatus,
      },
      signer: { guardian: client }
    })
    await action.run(registry)
    const configArtifact = await readArtifact('Config')
    // check mode status
    for (let i = 0; i < modeStatus.length; i++) {
      const mode = modeStatus[i]
      const onChainConfig = await client.publicClient.readContract({
        address: registry.configProxy!,
        abi: configArtifact.abi,
        functionName: 'getModeStatus',
        args: [mode.mode],
      })

      expect(onChainConfig.canCollateralize).toStrictEqual(false)
      expect(onChainConfig.canDecollateralize).toStrictEqual(false)
      expect(onChainConfig.canBorrow).toStrictEqual(false)
      expect(onChainConfig.canRepay).toStrictEqual(false)
    }
  })


  test('test correct name', async () => {
    expect(SetModeStatusAction.name).toStrictEqual('SetModeStatusAction')
  })
  test('test correct calldata', async () => {
    const data: SetModeStatusActionData = {
      signer: { guardian: client },
      params: {
        config: '0xCD399994982B3a3836B8FE81f7127cC5148e9BaE',
        modeStatus: [
          { mode: 1, status: { canCollateralize: true, canDecollateralize: false, canBorrow: true, canRepay: false } },
          { mode: 2, status: { canCollateralize: false, canDecollateralize: false, canBorrow: false, canRepay: false } },
        ],
      },
    }
    // data.
    const SetModeStatusAction = new SetModeStatusActionTest(data)
    const subActions: SetModeStatusSubAction[] = SetModeStatusAction.getSubActions() as SetModeStatusSubAction[]
    expect(subActions[0].params.config).toStrictEqual(data.params.config)

    for (let j = 0; j < subActions.length; j++) {
      for (let i = 0; i < subActions[j].txBuilders.length; i++) {
        const txBuilder = subActions[j].txBuilders[i] as SetModeStatusTxBuilder
        const mockTxBuilder = data.params.modeStatus[i]
        expect(txBuilder.mode === mockTxBuilder.mode).toBeTruthy()

        Object.keys(txBuilder.status).forEach((key) => {
          const poolConfigKey = key as keyof ModeStatus
          expect(txBuilder.status[poolConfigKey] === mockTxBuilder.status[poolConfigKey]).toBeTruthy()
        })
      }
    }
  })
})
