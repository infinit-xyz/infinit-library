import { Address, Hex } from 'viem'

import { InfinitWallet } from '@infinit-xyz/core'

import { ACLManager$Type } from '@/artifacts/aave-v3/aave-v3-core/contracts/protocol/configuration/ACLManager.sol/ACLManager'
import { Pool$Type } from '@/artifacts/aave-v3/aave-v3-core/contracts/protocol/pool/Pool.sol/Pool'
import { AToken$Type } from '@/artifacts/aave-v3/aave-v3-core/contracts/protocol/tokenization/AToken.sol/AToken'

export function getLiquidationThreshold(config: bigint): bigint {
  //bit 16-31: Liq. threshold
  const LIQUIDATION_THRESHOLD_MASK = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000ffffn
  const LIQUIDATION_THRESHOLD_SHIFT = 16n
  return (config & ~LIQUIDATION_THRESHOLD_MASK) >> LIQUIDATION_THRESHOLD_SHIFT
}

export function getLiquidationBonus(config: bigint): bigint {
  //bit 32-47: Liq. bonus
  const LIQUIDATION_BONUS_MASK = 0xffffffffffffffffffffffffffffffffffffffffffffffffffff0000ffffffffn
  const LIQUIDATION_BONUS_SHIFT = 32n
  return (config & ~LIQUIDATION_BONUS_MASK) >> LIQUIDATION_BONUS_SHIFT
}

export function getLtv(config: bigint): bigint {
  // bit 0-15: LTV
  const LTV_MASK = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000n
  return config & ~LTV_MASK
}

export async function getTotalSupply(client: InfinitWallet, aToken: AToken$Type, token: Address): Promise<bigint> {
  const publicClient = client.publicClient
  return await publicClient.readContract({
    address: token,
    abi: aToken.abi,
    functionName: 'totalSupply',
    args: [],
  })
}

export type ReserveData = {
  configuration: {
    data: bigint
  }
  liquidityIndex: bigint
  currentLiquidityRate: bigint
  variableBorrowIndex: bigint
  currentVariableBorrowRate: bigint
  currentStableBorrowRate: bigint
  lastUpdateTimestamp: number
  id: number
  aTokenAddress: Address
  stableDebtTokenAddress: Address
  variableDebtTokenAddress: Address
  interestRateStrategyAddress: Address
  accruedToTreasury: bigint
  unbacked: bigint
  isolationModeTotalDebt: bigint
}

export async function getReserveData(client: InfinitWallet, poolArtifact: Pool$Type, pool: Address, token: Address): Promise<ReserveData> {
  const publicClient = client.publicClient
  return await publicClient.readContract({
    address: pool,
    abi: poolArtifact.abi,
    functionName: 'getReserveData',
    args: [token],
  })
}

export async function getReservesList(client: InfinitWallet, poolArtifact: Pool$Type, pool: Address): Promise<readonly Address[]> {
  const publicClient = client.publicClient
  return await publicClient.readContract({
    address: pool,
    abi: poolArtifact.abi,
    functionName: 'getReservesList',
    args: [],
  })
}

export async function hasRole(
  client: InfinitWallet,
  aclManagerArtifact: ACLManager$Type,
  aclManager: Address,
  role: Hex,
  user: Address,
): Promise<boolean> {
  const publicClient = client.publicClient
  return await publicClient.readContract({
    address: aclManager,
    abi: aclManagerArtifact.abi,
    functionName: 'hasRole',
    args: [role, user],
  })
}

export async function isPoolAdmin(
  client: InfinitWallet,
  aclManagerArtifact: ACLManager$Type,
  aclManager: Address,
  user: Address,
): Promise<boolean> {
  const publicClient = client.publicClient
  return await publicClient.readContract({
    address: aclManager,
    abi: aclManagerArtifact.abi,
    functionName: 'isPoolAdmin',
    args: [user],
  })
}

export async function isEmergencyAdmin(
  client: InfinitWallet,
  aclManagerArtifact: ACLManager$Type,
  aclManager: Address,
  user: Address,
): Promise<boolean> {
  const publicClient = client.publicClient
  return await publicClient.readContract({
    address: aclManager,
    abi: aclManagerArtifact.abi,
    functionName: 'isEmergencyAdmin',
    args: [user],
  })
}
export async function isAssetListingAdmin(
  client: InfinitWallet,
  aclManagerArtifact: ACLManager$Type,
  aclManager: Address,
  user: Address,
): Promise<boolean> {
  const publicClient = client.publicClient
  return await publicClient.readContract({
    address: aclManager,
    abi: aclManagerArtifact.abi,
    functionName: 'isAssetListingAdmin',
    args: [user],
  })
}

export async function isRiskAdmin(
  client: InfinitWallet,
  aclManagerArtifact: ACLManager$Type,
  aclManager: Address,
  user: Address,
): Promise<boolean> {
  const publicClient = client.publicClient
  return await publicClient.readContract({
    address: aclManager,
    abi: aclManagerArtifact.abi,
    functionName: 'isRiskAdmin',
    args: [user],
  })
}
export async function isRiskOrPoolAdmin(
  client: InfinitWallet,
  aclManagerArtifact: ACLManager$Type,
  aclManager: Address,
  user: Address,
): Promise<boolean> {
  const publicClient = client.publicClient
  let flag = await publicClient.readContract({
    address: aclManager,
    abi: aclManagerArtifact.abi,
    functionName: 'isRiskAdmin',
    args: [user],
  })
  flag = flag || (await isPoolAdmin(client, aclManagerArtifact, aclManager, user))
  return flag
}
