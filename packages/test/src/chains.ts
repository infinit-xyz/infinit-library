import { type Chain as viem_Chain, arbitrum as viem_arbitrum, fantom as viem_fantom } from 'viem/chains'

import { TestChain } from './constants.js'
import { getRpcUrls } from './utils.js'

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
if (!process.env.VITE_FANTOM_RPC_URL) {
  console.error('!VITE_FANTOM_RPC_URL')
}

const RPC_URL = {
  [TestChain.arbitrum]: process.env.VITE_ARBITRUM_RPC_URL ?? 'https://1rpc.io/arb',
  [TestChain.fantom]: process.env.VITE_FANTOM_RPC_URL ?? 'https://fantom-pokt.nodies.app',
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

const fantom = {
  ...getRpcUrls(TestChain.fantom),
  ...viem_fantom,
  fork: {
    // blockNumber: 1n,
    url: RPC_URL.fantom,
  },
} as const satisfies ChainData

export const chains = {
  [TestChain.arbitrum]: arbitrum,
  [TestChain.fantom]: fantom,
}
