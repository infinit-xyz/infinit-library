import { TestChain } from './constants.js'
import { getRpcUrls } from './utils.js'
import { type Chain as viem_Chain, arbitrum as viem_arbitrum } from 'viem/chains'

type Compute<type> = { [key in keyof type]: type[key] } & unknown

type Fork = { blockNumber?: bigint; url: string }

type ChainData = Compute<
  viem_Chain & {
    fork: Fork
    port: number
  }
>

/**
 * FORK URL
 */
if (!process.env.VITE_ARBITRUM_RPC_URL) {
  console.error('!VITE_ARBITRUM_RPC_URL')
}

const RPC_URL = {
  [TestChain.arbitrum]: process.env.VITE_ARBITRUM_RPC_URL ?? 'https://arbitrum.llamarpc.com',
}

/**
 * Chain
 */
const arbitrum = {
  ...getRpcUrls(TestChain.arbitrum),
  ...viem_arbitrum,
  fork: {
    // blockNumber: 1n,
    url: RPC_URL.arbitrum,
  },
} as const satisfies ChainData

export const chains = {
  [TestChain.arbitrum]: arbitrum,
}
