import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES, TEST_ADDRESSES } from '@actions/__mock__/address'
import { AddEmergencyAdminSubAction } from '@actions/subactions/addEmegencyAdmin'
import { RemoveEmergencyAdminSubAction } from '@actions/subactions/removeEmegencyAdmin'
import { isEmergencyAdmin } from '@actions/subactions/tx-builders/utils'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('AddRemoveEmergencyAdminSubAction', () => {
  const registry: AaveV3Registry = {}
  const aclManager = ARBITRUM_TEST_ADDRESSES.aclManager
  const bob = TEST_ADDRESSES.bob
  const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('add then remove emergency admin', async () => {
    const aclManagerArtifact = await readArtifact('ACLManager')
    let subaction
    // add
    subaction = new AddEmergencyAdminSubAction(client, {
      aclManager,
      emergencyAdmin: bob,
    })
    expect(subaction.validate())
    await subaction.execute(registry)
    expect(await isEmergencyAdmin(client, aclManagerArtifact, aclManager, bob)).toBeTruthy()
    // remove
    subaction = new RemoveEmergencyAdminSubAction(client, {
      aclManager,
      emergencyAdmin: bob,
    })
    expect(subaction.validate())
    await subaction.execute(registry)
    expect(await isEmergencyAdmin(client, aclManagerArtifact, aclManager, bob)).toBeFalsy()
  })
})
