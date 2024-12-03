import { createServer } from 'prool'

import { chains } from './chains.js'
import { anvil } from 'prool/instances'

export default async function () {
  console.log('⚡️ [INFINIT] Running Global Setup...')

  let serverResults: (() => Promise<void>)[] = []

  if (process.env.VITE_RUN_LOCAL_ANVIL === 'true') {
    console.log('ℹ️ VITE_RUN_LOCAL_ANVIL is true')
  } else {
    const servers = Object.values(chains).map((chain) =>
      createServer({
        instance: anvil({
          chainId: chain.id,
          forkUrl: chain.fork.url,
          timeout: 200000,
          // forkBlockNumber: chain.fork.blockNumber,
          // noMining: true,
          // configOut: './anvil-config.json',
        }),
        port: chain.port,
      }),
    )

    serverResults = await Promise.all(servers.map((server) => server.start()))
  }

  console.log('⚡️ [INFINIT] Global Setup Done')

  return async () => {
    console.log('⚡️ [INFINIT] Ending Global Setup...')

    await Promise.all(serverResults.map((stop) => stop()))

    console.log('⚡️ [INFINIT] Global setup ended')
  }
}
