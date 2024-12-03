import { Address } from 'viem'

export type PendleRegistry = {
  multicall?: Address
  pendleMulticallV2?: Address
  simulateHelper?: Address
  supplyCapReader?: Address
}
