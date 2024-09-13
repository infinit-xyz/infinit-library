import { Address } from 'viem'

export type UniswapV3Registry = {
  uniswapV3Factory?: Address
  nftDescriptor?: Address
  tickLens?: Address
  proxyAdmin?: Address
  swapRouter02?: Address
  quoterV2?: Address
  nonfungibleTokenPositionDescriptorImpl?: Address
  nonfungibleTokenPositionDescriptor?: Address
  nonfungiblePositionManager?: Address
  uniswapV3Staker?: Address
  permit2?: Address
  universalRouter?: Address
  unsupportedProtocol?: Address
}
