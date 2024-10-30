import { afterEach } from 'vitest'

import { TestClient } from 'viem'

import { testClients } from '../client.js'

afterEach(async () => {
  // Reset anvil after each test
  await Promise.all(Object.values<TestClient>(testClients).map((client) => client.reset()))
})
