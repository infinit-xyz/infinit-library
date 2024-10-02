import { createServer } from 'prool'

import { chains } from './chains.js'
import { anvil } from 'prool/instances'

export default async function () {
  console.log('⚡️ [INFINIT] Running Global Setup...')

  const servers = Object.values(chains).map((chain) =>
    createServer({
      instance: anvil({
        chainId: chain.id,
        forkUrl: chain.fork.url,
        // forkBlockNumber: chain.fork.blockNumber,
        // noMining: true,
        // configOut: './anvil-config.json',
      }),
      port: chain.port,
    }),
  )

  const serverResults = await Promise.all(servers.map((server) => server.start()))

  return async () => {
    console.log('⚡️ [INFINIT] Ending Global Setup...')

    await Promise.all(serverResults.map((stop) => stop()))

    console.log('⚡️ [INFINIT] Global setup ended')
  }
}
