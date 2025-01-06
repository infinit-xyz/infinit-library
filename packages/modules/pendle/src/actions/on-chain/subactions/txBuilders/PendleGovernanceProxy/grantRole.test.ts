import { describe, expect, test } from 'vitest'

import { keccak256, toHex, zeroAddress } from 'viem'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import {
  GrantRolePendleGovernanceProxyTxBuilder,
  GrantRolePendleGovernanceProxyTxBuilderParams,
} from '@actions/on-chain/subactions/txBuilders/PendleGovernanceProxy/grantRole'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('GrantRolePendleGovernanceProxyTxBuilder', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: GrantRolePendleGovernanceProxyTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('tx data should be correct', async () => {
    const params: GrantRolePendleGovernanceProxyTxBuilderParams = {
      pendleGovernanceProxy: '0x0000000000000000000000000000000000000002',
      role: keccak256(toHex('ROLE')),
      account: zeroAddress,
    }
    txBuilder = new GrantRolePendleGovernanceProxyTxBuilder(client, params)
    const bt = await txBuilder.buildTx()

    expect(bt.to).not.toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate pendleGovernanceProxy zero address should fail', async () => {
    txBuilder = new GrantRolePendleGovernanceProxyTxBuilder(client, {
      pendleGovernanceProxy: zeroAddress,
      role: toHex('ROLE'),
      account: '0x0000000000000000000000000000000000000002',
    })
    expect(txBuilder.validate()).rejects.toThrowError()
  })

  test('test validate wrong role', async () => {
    txBuilder = new GrantRolePendleGovernanceProxyTxBuilder(client, {
      pendleGovernanceProxy: '0x0000000000000000000000000000000000000002',
      role: '0xg',
      account: '0x0000000000000000000000000000000000000002',
    })
    expect(txBuilder.validate()).rejects.toThrowError('Role should be a hex string')
  })

  test('test validate zero address account', async () => {
    txBuilder = new GrantRolePendleGovernanceProxyTxBuilder(client, {
      pendleGovernanceProxy: '0x0000000000000000000000000000000000000002',
      role: '0xg',
      account: '0x0000000000000000000000000000000000000000',
    })
    expect(txBuilder.validate()).rejects.toThrowError('ACCOUNT')
  })
})
