import { Address, Hex } from 'viem'

import { InfinitWallet } from '@infinit-xyz/core'

import { AccessControlManager$Type } from '@/artifacts/init-capital/init-capital/contracts/common/AccessControlManager.sol/AccessControlManager'

export async function hasRole(
  client: InfinitWallet,
  accessControlManagerArtifact: AccessControlManager$Type,
  accessControlManager: Address,
  role: Hex,
  user: Address,
): Promise<boolean> {
  const publicClient = client.publicClient
  return await publicClient.readContract({
    address: accessControlManager,
    abi: accessControlManagerArtifact.abi,
    functionName: 'hasRole',
    args: [role, user],
  })
}
