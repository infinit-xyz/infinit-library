import { afterEach, describe, expect, test, vi } from 'vitest'

import { TestChain } from './constants'
import { getForkRpcUrl, getRpcUrls } from './utils'

describe('utils.ts', () => {
  describe('getRpcUrls', () => {
    test('snapshot data for arbitrum', () => {
      const result = getRpcUrls(TestChain.arbitrum)

      expect(result).toStrictEqual({
        port: 8545,
        rpcUrls: {
          default: {
            http: ['http://127.0.0.1:8545'],
            webSocket: ['ws://127.0.0.1:8545'],
          },
          public: {
            http: ['http://127.0.0.1:8545'],
            webSocket: ['ws://127.0.0.1:8545'],
          },
        },
      })
    })
  })

  describe('getForkRpcUrl', () => {
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    test('force local anvil', () => {
      vi.stubEnv('VITE_RUN_LOCAL_ANVIL', 'true')

      const result = getForkRpcUrl(TestChain.arbitrum)

      expect(result).toBe('http://127.0.0.1:8545')
    })

    test('snapshot arbitrum', () => {
      vi.stubEnv('VITEST_POOL_ID', '13')

      const result = getForkRpcUrl(TestChain.arbitrum)

      expect(result).toBe('http://127.0.0.1:8545/13')
    })
  })
})
