import path from 'path'
import { beforeAll, describe, expect, test, vi } from 'vitest'

import { PublicClient, createPublicClient, http } from 'viem'
import { arbitrumSepolia, holesky } from 'viem/chains'

import { verifyContract } from '../verifyContract'
import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan'
import { Artifacts as ArtifactsFromPath } from 'hardhat/internal/artifacts'

describe('verifyContract', () => {
  const address = '0x9a3c2b73adac0f85e04ea049df31ffc2a8e35401'
  const invalidAddress = '0x87646Ac012AC9ffbBc3A37ec516Bd0d661b408ed'
  const eoaAddress = '0xEE14Fd83e9C500500cFedf7522Cd26Af2F0A34fd'
  const rpc = 'https://arbitrum-sepolia-rpc.publicnode.com'
  const artifacts = new ArtifactsFromPath(
    path.join(process.cwd(), 'packages/core/src/utils/contract-verifier/helper/__mocks__/mock-artifacts'),
  )
  let client: PublicClient

  const instanceEtherscan = new Etherscan(
    process.env.SEPOLIA_ARBISCAN_API_KEY ?? 'NO_API_KEY',
    'https://api-sepolia.arbiscan.io/api',
    'https://sepolia.arbiscan.io',
  )

  beforeAll(async () => {
    client = await createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpc),
    })
  })

  test('verify contract (etherscan)', async () => {
    const isVerifiedSpy = vi.spyOn(instanceEtherscan, 'isVerified').mockResolvedValue(false)
    const verifySpy = vi.spyOn(instanceEtherscan, 'verify').mockReturnValue({
      message: vi.fn().mockReturnValue('guid'),
    } as any)
    const getVerificationStatusSpy = vi.spyOn(instanceEtherscan, 'getVerificationStatus').mockReturnValue({
      isSuccess: vi.fn().mockReturnValue(true),
      isAlreadyVerified: vi.fn().mockReturnValue(false),
    } as any)
    await verifyContract(client, instanceEtherscan, artifacts, { address: address })
    expect(isVerifiedSpy).toHaveBeenCalled()
    expect(verifySpy).toHaveBeenCalled()
    expect(getVerificationStatusSpy).toHaveBeenCalled()
  })

  test('verify contract (blockscout)', async () => {
    const instanceBlockscout = new Etherscan('BLOCKSCOUT', 'https://eth-holesky.blockscout.com/api', 'https://eth-holesky.blockscout.com')
    const isVerifiedSpy = vi.spyOn(instanceBlockscout, 'isVerified').mockResolvedValue(false)
    const verifySpy = vi.spyOn(instanceBlockscout, 'verify').mockReturnValue({
      message: vi.fn().mockReturnValue('guid'),
    } as any)
    const getVerificationStatusSpy = vi.spyOn(instanceBlockscout, 'getVerificationStatus').mockReturnValue({
      isSuccess: vi.fn().mockReturnValue(true),
      isAlreadyVerified: vi.fn().mockReturnValue(false),
    } as any)
    await verifyContract(
      await createPublicClient({
        chain: holesky,
        transport: http('https://holesky.drpc.org'),
      }),
      instanceBlockscout,
      artifacts,
      { address: '0x67e2eb9e8c38b2597e835a3914822f92bb43a193' },
    )
    expect(isVerifiedSpy).toHaveBeenCalled()
    expect(verifySpy).toHaveBeenCalled()
    expect(getVerificationStatusSpy).toHaveBeenCalled()
  })

  test('verify eoa address', async () => {
    expect(verifyContract(client, instanceEtherscan, artifacts, { address: eoaAddress })).rejects.toThrowError()
  })

  test('verify without artifact', async () => {
    expect(verifyContract(client, instanceEtherscan, artifacts, { address: invalidAddress })).rejects.toThrowError()
  })

  test('verify verified contract', async () => {
    const isVerifiedSpy = vi.spyOn(instanceEtherscan, 'isVerified').mockResolvedValue(true)
    const verifySpy = vi.spyOn(instanceEtherscan, 'verify').mockReturnValue({
      message: vi.fn().mockReturnValue('guid'),
    } as any)
    const getVerificationStatusSpy = vi.spyOn(instanceEtherscan, 'getVerificationStatus').mockReturnValue({
      isSuccess: vi.fn().mockReturnValue(true),
      isAlreadyVerified: vi.fn().mockReturnValue(false),
    } as any)
    await verifyContract(client, instanceEtherscan, artifacts, { address: address })
    expect(isVerifiedSpy).toHaveBeenCalled()
    expect(verifySpy).not.toHaveBeenCalled()
    expect(getVerificationStatusSpy).not.toHaveBeenCalled()
  })
})
