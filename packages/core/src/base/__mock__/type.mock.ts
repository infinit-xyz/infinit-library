import { Address } from 'viem'

import { InfinitWallet } from '@infinit-wallet/index'

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
