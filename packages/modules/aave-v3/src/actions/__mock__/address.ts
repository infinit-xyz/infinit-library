import { Address } from 'viem'

export const ARBITRUM_TEST_ADDRESSES = {
  // ERC20 Tokens
  weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  pepe: '0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00',

  // AAVE Contracts
  poolAddressProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
  pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  poolConfigurator: '0x8145eddDf43f50276641b55bd3AD95944510021E',
  aclManager: '0xa72636CbcAa8F5FF95B2cc47F3CDEe83F3294a0B',
  interestRateStrategyAddress: '0x42ec99A020B78C449d17d93bC4c89e0189B5811d',

  // Misc
  chainlinkEthFeeder: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
  oneAddress: '0x0000 e e000000000000000000000000000000000001',
  api3EthUsdDapiProxy: '0xf624881ac131210716F7708C28403cCBe346cB73',
  pyth: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
  pythWethUsdPriceFeedId: '0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6',

  // User
  aaveExecutor: '0xFF1137243698CaA18EE364Cc966CF0e02A4e6327',
  aaveEmergencyAdmin: '0xbbd9f90699c1FA0D7A65870D241DD1f1217c96Eb',
  tester: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
} satisfies Record<string, Address>

export const TEST_ADDRESSES = {
  // test
  bob: '0x0000000000000000000000000000000000000B0b',
} satisfies Record<string, Address>
