import { Address, Hex } from 'viem'

export enum TokenType {
  'InfinitERC20' = 'InfinitERC20',
  'InfinitERC20Burnable' = 'InfinitERC20Burnable',
}

export type Token = { type: TokenType }
export type MerkleDistributor = { implementation: Address }

export type TokenRegistry = {
  tokens?: Record<Address, Token>
  accumulativeMerkleDistributors?: Record<Address, MerkleDistributor>
  merkleTree?: {
    root: string
    merkle: Record<Address, { amount: string; proof: Hex[] }>
  }
}
