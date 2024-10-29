import { FORK_PORT, FORK_RPC_BASE_HTTP, FORK_RPC_BASE_WS, FORK_RPC_URL, TestChain } from './constants.js'

export const getRpcUrls = (chain: TestChain) => {
  const port = FORK_PORT[chain]
  return {
    port: port,
    rpcUrls: {
      // These rpc urls are automatically used in the transports.
      default: {
        // Note how we append the worker id to the local rpc urls.
        http: [`${FORK_RPC_BASE_HTTP}:${port}`],
        webSocket: [`${FORK_RPC_BASE_WS}:${port}`],
      },
      public: {
        // Note how we append the worker id to the local rpc urls.
        http: [`${FORK_RPC_BASE_HTTP}:${port}`],
        webSocket: [`${FORK_RPC_BASE_WS}:${port}`],
      },
    },
  } as const
}

export const getForkRpcUrl = (chain: TestChain) => {
  if (process.env.VITE_RUN_LOCAL_ANVIL === 'true') {
    return `${FORK_RPC_URL[chain]}`
  }

  return `${FORK_RPC_URL[chain]}/${process.env.VITEST_POOL_ID}`
}
