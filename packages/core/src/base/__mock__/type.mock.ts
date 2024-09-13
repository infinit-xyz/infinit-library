import { InfinitWallet } from '@infinit-wallet/index'

import { Address } from 'viem'

type MockRegistry = {
  poolAddress?: Address
  owner?: Address
}

type MockActionParams = {
  poolAddress: Address
}

type MockActionData = {
  params: MockActionParams
  signer: {
    dev: InfinitWallet
    exec: InfinitWallet
  }
}

type MockSubActionParams = {
  status: boolean
}

export { MockRegistry, MockActionData, MockActionParams, MockSubActionParams }
