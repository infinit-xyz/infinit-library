import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES, TEST_ADDRESSES } from '@actions/__mock__/address'
import { AddPoolAdminSubAction } from '@actions/subactions/addPoolAdmin'
import { RemovePoolAdminSubAction } from '@actions/subactions/removePoolAdmin'
import { isPoolAdmin } from '@actions/subactions/tx-builders/utils'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('AddRemovePoolAdminSubAction', () => {
  const registry: AaveV3Registry = {}
  const aclManager = ARBITRUM_TEST_ADDRESSES.aclManager
  const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor
  const bob = TEST_ADDRESSES.bob
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('add then remove emergency admin', async () => {
    const aclManagerArtifact = await readArtifact('ACLManager')
    let subaction
    // add
    subaction = new AddPoolAdminSubAction(client, {
      aclManager,
      poolAdmin: bob,
    })
    expect(subaction.validate())
    await subaction.execute(registry)
    expect(await isPoolAdmin(client, aclManagerArtifact, aclManager, bob)).toBeTruthy()
    // remove
    subaction = new RemovePoolAdminSubAction(client, {
      aclManager,
      poolAdmin: bob,
    })
    expect(subaction.validate())
    await subaction.execute(registry)
    expect(await isPoolAdmin(client, aclManagerArtifact, aclManager, bob)).toBeFalsy()
  })
})
