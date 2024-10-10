export enum TestChain {
  arbitrum = 'arbitrum',
  fantom = 'fantom',
}

export const FORK_PORT: Record<TestChain, number> = {
  [TestChain.arbitrum]: 8545,
  [TestChain.fantom]: 8546,
}

export const FORK_RPC_BASE_HTTP = 'http://127.0.0.1'
export const FORK_RPC_BASE_WS = 'ws://127.0.0.1'

export const FORK_RPC_URL = {
  [TestChain.arbitrum]: `${FORK_RPC_BASE_HTTP}:${FORK_PORT.arbitrum}`,
  [TestChain.fantom]: `${FORK_RPC_BASE_HTTP}:${FORK_PORT.fantom}`,
}
