import { CustomErrorParams, z } from 'zod'

import { Address, Hex, isAddress, isHex, zeroAddress } from 'viem'

/**
 * Address
 */
const validateZodAddress = (address: Address): boolean => {
  // soft check address (not validate check sum)
  return isAddress(address, { strict: false })
}

const zodAddressError = (input: any): CustomErrorParams => {
  return { message: `'${input}' is not a valid address` }
}

const zodAddress = z.custom<Address>(validateZodAddress, zodAddressError)
const zodAddressNonZero = zodAddress.refine((address) => address !== zeroAddress, 'Address cannot be the zero address')

/**
 * Hex
 */
const validateZodHex = (hex: Hex): boolean => {
  return isHex(hex)
}

const zodHexError = (input: any): CustomErrorParams => {
  return { message: `'${input}' is not a valid hex` }
}

const zodHex = z.custom<Hex>(validateZodHex, zodHexError)

/**
 * Exports
 */
export { zodAddress, zodAddressNonZero, zodHex }
