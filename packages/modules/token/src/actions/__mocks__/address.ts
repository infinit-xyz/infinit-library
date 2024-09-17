import { Address } from 'viem'

export const TEST_ADDRESSES = {
  // test
  bob: '0x0000000000000000000000000000000000000b0b',
  tester: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  tester2: '0x3cf4d050143c776afcdf1ee7a252ab16c3f231f7',
} satisfies Record<string, Address>
