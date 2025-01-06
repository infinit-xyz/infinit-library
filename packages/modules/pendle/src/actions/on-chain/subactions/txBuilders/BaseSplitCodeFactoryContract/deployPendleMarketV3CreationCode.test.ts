import { describe, expect, test } from 'vitest'

import { ToSendTransaction } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES, TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployBaseSplitCodeFactoryContractTxBuilder } from '@actions/on-chain/subactions/txBuilders/BaseSplitCodeFactoryContract/deploy'

import { DeployPendleMarketV3CreationCodeTxBuilder } from './deployPendleMarketV3CreationCode'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('DeployPendleMarketV3CreationCode', () => {
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  // const txBuilder: DeployBaseSplitCodeFactoryContractTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  const txBuilder = new DeployBaseSplitCodeFactoryContractTxBuilder(client)

  test('test tx correct to address and has data', async () => {
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('test validate should be pass', async () => {
    const deployBaseSplitCodeFactory = new DeployBaseSplitCodeFactoryContractTxBuilder(client)
    const deployOracleLib = new DeployBaseSplitCodeFactoryContractTxBuilder(client)

    const toSendTxs: ToSendTransaction[] = [
      { name: 'deployContract', txData: await deployBaseSplitCodeFactory.buildTx() },
      { name: 'deployOracleLib', txData: await deployOracleLib.buildTx() },
    ]
    const txs = await client.sendTransactions(toSendTxs)

    const txBuilder2 = new DeployPendleMarketV3CreationCodeTxBuilder(client, {
      baseSplitCodeFactoryContact: txs[0].contractAddress!,
      oracleLib: txs[1].contractAddress!,
    })
    const toSendTxsDeployCreationCode = [{ name: 'deployContract', txData: await txBuilder2.buildTx() }]
    await client.sendTransactions(toSendTxsDeployCreationCode)

    expect(txBuilder.validate()).resolves.not.toThrowError()
  })

  test('deployCreationCode test caller not owner', async () => {
    const deployBaseSplitCodeFactory = new DeployBaseSplitCodeFactoryContractTxBuilder(client)
    const deployOracleLib = new DeployBaseSplitCodeFactoryContractTxBuilder(client)

    const toSendTxs: ToSendTransaction[] = [
      { name: 'deployContract', txData: await deployBaseSplitCodeFactory.buildTx() },
      { name: 'deployOracleLib', txData: await deployOracleLib.buildTx() },
    ]
    const txs = await client.sendTransactions(toSendTxs)

    const bob = new TestInfinitWallet(TestChain.arbitrum, TEST_ADDRESSES.bob)
    const txBuilder2 = new DeployPendleMarketV3CreationCodeTxBuilder(bob, {
      baseSplitCodeFactoryContact: txs[0].contractAddress!,
      oracleLib: txs[1].contractAddress!,
    })

    expect(txBuilder2.validate()).rejects.toThrowError('CALLER_NOT_OWNER')
  })
})
