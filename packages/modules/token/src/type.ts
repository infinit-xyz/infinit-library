import { Address, Hex } from 'viem'

export enum TokenType {
  'InfinitERC20' = 'InfinitERC20',
  'InfinitERC20Burnable' = 'InfinitERC20Burnable',
}

export type Token = { type: TokenType }
export type Proxy = { proxyAddress: Address; implementation: Address }

export type TokenRegistry = {
  tokens?: Record<Address, Token>
  tokenDistributors?: Address[]
  accumulativeMerkleDistributors?: Record<Address, Proxy>
  merkleTree?: {
    root: string
    merkle: Record<Address, { amount: string; proof: Hex[] }>
  }
}
