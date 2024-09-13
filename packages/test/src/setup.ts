import { testClients } from 'packages/test/src/client.js'
import { afterEach } from 'vitest'

import { TestClient } from 'viem'

afterEach(async () => {
  // Reset anvil after each test
  await Promise.all(Object.values<TestClient>(testClients).map((client) => client.reset()))
})
