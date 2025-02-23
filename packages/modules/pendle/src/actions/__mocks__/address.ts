import { Address } from 'viem'

export const TEST_ADDRESSES = {
  // test
  bob: '0x0000000000000000000000000000000000000B0b',
  tester: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  tester2: '0x3cf4d050143c776afcdf1ee7a252ab16c3f231f7',
} satisfies Record<string, Address>

export const ARBITRUM_TEST_ADDRESSES = {
  // ERC20 Tokens
  weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  pepe: '0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00',
  usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',

  // AAVE Contracts
  poolAddressProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
  pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  poolConfigurator: '0x8145eddDf43f50276641b55bd3AD95944510021E',
  aclManager: '0xa72636CbcAa8F5FF95B2cc47F3CDEe83F3294a0B',
  interestRateStrategyAddress: '0x42ec99A020B78C449d17d93bC4c89e0189B5811d',

  // Misc
  chainlinkEthFeeder: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
  oneAddress: '0x0000000000000000000000000000000000000001',

  // User
  aaveExecutor: '0xFF1137243698CaA18EE364Cc966CF0e02A4e6327',
  aaveEmergencyAdmin: '0xbbd9f90699c1FA0D7A65870D241DD1f1217c96Eb',
  tester: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',

  // Pendle
  syAUsdc: '0x50288c30c37FA1Ec6167a31E575EA8632645dE20',
  pendle: '0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8'
} satisfies Record<string, Address>
