import { describe, expect, test } from 'vitest'

import { ARBITRUM_TEST_ADDRESSES, TEST_ADDRESSES } from '@actions/__mock__/address'
import { AddAssetListingAdminSubAction } from '@actions/subactions/addAssetListingAdmin'
import { RemoveAssetListingAdminSubAction } from '@actions/subactions/removeAssetListingAdmin'
import { isAssetListingAdmin } from '@actions/subactions/tx-builders/utils'

import { AaveV3Registry } from '@/src/type'
import { readArtifact } from '@/src/utils/artifact'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('AddRemoveAssetListingAdminSubAction', () => {
  const registry: AaveV3Registry = {}
  const aclManager = ARBITRUM_TEST_ADDRESSES.aclManager
  const tester = ARBITRUM_TEST_ADDRESSES.aaveExecutor
  const bob = TEST_ADDRESSES.bob
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('add then remove asset listing admin', async () => {
    const aclManagerArtifact = await readArtifact('ACLManager')
    let subAction
    const assetListingAdmin = bob
    // add
    subAction = new AddAssetListingAdminSubAction(client, {
      aclManager,
      assetListingAdmin,
    })
    expect(subAction.validate())
    await subAction.execute(registry)
    expect(await isAssetListingAdmin(client, aclManagerArtifact, aclManager, bob)).toBeTruthy()
    // remove
    subAction = new RemoveAssetListingAdminSubAction(client, {
      aclManager,
      assetListingAdmin,
    })
    expect(subAction.validate())
    await subAction.execute(registry)
    expect(await isAssetListingAdmin(client, aclManagerArtifact, aclManager, bob)).toBeFalsy()
  })
})
