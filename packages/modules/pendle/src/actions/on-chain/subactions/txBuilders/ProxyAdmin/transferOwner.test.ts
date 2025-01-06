import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { TransferOwnerTxBuilder } from '@actions/on-chain/subactions/txBuilders/ProxyAdmin/transferOwner'

import { DeployProxyAdminTxBuilder } from './deploy'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('TransferOwnerTxBuilderParams', () => {
  const tester = TEST_ADDRESSES.bob
  let txBuilder: TransferOwnerTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  test('test tx correct to address and has data', async () => {
    txBuilder = new TransferOwnerTxBuilder(client, {
      newOwner: '0x0000000000000000000000000000000000000002',
      proxyAdmin: '0x0000000000000000000000000000000000000003',
    })
    const bt = await txBuilder.buildTx()
    expect(bt.to).not.toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate success', async () => {
    const deployTxBuilder = new DeployProxyAdminTxBuilder(client)
    const txs = await client.sendTransactions([{ name: '1', txData: await deployTxBuilder.buildTx() }])

    txBuilder = new TransferOwnerTxBuilder(client, {
      newOwner: '0x0000000000000000000000000000000000000002',
      proxyAdmin: txs[0].contractAddress!,
    })

    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('test validate fail', async () => {
    const deployTxBuilder = new DeployProxyAdminTxBuilder(client)
    const txs = await client.sendTransactions([{ name: '1', txData: await deployTxBuilder.buildTx() }])

    const tester2 = new TestInfinitWallet(TestChain.arbitrum, TEST_ADDRESSES.tester2)
    txBuilder = new TransferOwnerTxBuilder(tester2, {
      newOwner: '0x0000000000000000000000000000000000000002',
      proxyAdmin: txs[0].contractAddress!,
    })

    expect(txBuilder.validate()).rejects.toThrowError('only owner can transfer owner')
  })
})
