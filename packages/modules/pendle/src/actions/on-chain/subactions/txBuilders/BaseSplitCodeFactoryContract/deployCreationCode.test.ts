import { describe, expect, test } from 'vitest'

import { ToSendTransaction } from '@infinit-xyz/core'

import { ARBITRUM_TEST_ADDRESSES, TEST_ADDRESSES } from '@actions/__mocks__/address'
import { DeployBaseSplitCodeFactoryContractTxBuilder } from '@actions/on-chain/subactions/txBuilders/BaseSplitCodeFactoryContract/deploy'

import { DeployCreationCodeTxBuilder } from './deployCreationCode'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'
import { readArtifact } from '@utils/artifact'

describe('DeployBaseSplitCodeFactoryContractTxBuilder', () => {
  const tester = ARBITRUM_TEST_ADDRESSES.tester
  let txBuilder: DeployBaseSplitCodeFactoryContractTxBuilder
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  txBuilder = new DeployBaseSplitCodeFactoryContractTxBuilder(client)

  test('test tx correct to address and has data', async () => {
    const bt = await txBuilder.buildTx()
    expect(bt.to).toBeNull()
    expect(bt.data).not.toBe('0x')
  })

  test('deployCreationCode test validate should be pass', async () => {
    const deployBaseSplitCodeFactory = new DeployBaseSplitCodeFactoryContractTxBuilder(client)
    const toSendTxs: ToSendTransaction[] = [{ name: 'deployContract', txData: await deployBaseSplitCodeFactory.buildTx() }]
    const txs = await client.sendTransactions(toSendTxs)

    const ytArtifact = await readArtifact('PendleYieldToken')
    const txBuilder2 = new DeployCreationCodeTxBuilder(client, {
      baseSplitCodeFactoryContact: txs[0].contractAddress!,
      contractName: 'yt',
      creationCode: ytArtifact.deployedBytecode,
    })
    const toSendTxsDeployCreationCode = [{ name: 'deployContract', txData: await txBuilder2.buildTx() }]
    await client.sendTransactions(toSendTxsDeployCreationCode)
    expect(txBuilder2.validate()).resolves.not.toThrowError()
  })

  test('deployCreationCode test caller not owner', async () => {
    const deployBaseSplitCodeFactory = new DeployBaseSplitCodeFactoryContractTxBuilder(client)
    const toSendTxs: ToSendTransaction[] = [{ name: 'deployContract', txData: await deployBaseSplitCodeFactory.buildTx() }]
    const txs = await client.sendTransactions(toSendTxs)

    const ytArtifact = await readArtifact('PendleYieldToken')
    const bob = new TestInfinitWallet(TestChain.arbitrum, TEST_ADDRESSES.bob)
    const txBuilder2 = new DeployCreationCodeTxBuilder(bob, {
      baseSplitCodeFactoryContact: txs[0].contractAddress!,
      contractName: 'yt',
      creationCode: ytArtifact.deployedBytecode,
    })

    expect(txBuilder2.validate()).rejects.toThrowError('CALLER_NOT_OWNER')
  })
})
