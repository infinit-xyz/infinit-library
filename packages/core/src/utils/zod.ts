import { CustomErrorParams, SomeZodObject, ZodError, z } from 'zod'

import { Address, Hex, isAddress, isHex, zeroAddress } from 'viem'

import { ValidateInputValueError } from '@/errors'
import { formatZodError } from '@/utils/validate'

/**
 * Validates the given data against the provided Zod schema.
 *
 * @param data - The data to validate.
 * @param schema - The Zod schema to validate against.
 * @throws {ValidateInputValueError} If the data does not conform to the schema.
 */
const validateZodObject = (data: any, schema: SomeZodObject): void => {
  try {
    schema.parse(data.params)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidateInputValueError(formatZodError(error), error)
    }

    // other error
    throw error
  }
}

/**
 * Validates if the given address is a valid Ethereum address.
 *
 * @param address - The address to validate.
 * @returns True if the address is valid, false otherwise.
 */
const validateZodAddress = (address: Address): boolean => {
  // soft check address (not validate check sum)
  return isAddress(address, { strict: false })
}

/**
 * Generates a custom error message for invalid addresses.
 *
 * @param input - The invalid address input.
 * @returns An object containing the error message.
 */
const zodAddressError = (input: any): CustomErrorParams => {
  return { message: `'${input}' is not a valid address` }
}

/**
 * Zod schema for validating Ethereum addresses.
 */
const zodAddress = z.custom<Address>(validateZodAddress, zodAddressError)

/**
 * Zod schema for validating non-zero Ethereum addresses.
 */
const zodAddressNonZero = zodAddress.refine((address) => address !== zeroAddress, 'Address cannot be the zero address')

/**
 * Validates if the given hex string is a valid hexadecimal value.
 *
 * @param hex - The hex string to validate.
 * @returns True if the hex string is valid, false otherwise.
 */
const validateZodHex = (hex: Hex): boolean => {
  return isHex(hex)
}

/**
 * Generates a custom error message for invalid hex strings.
 *
 * @param input - The invalid hex input.
 * @returns An object containing the error message.
 */
const zodHexError = (input: any): CustomErrorParams => {
  return { message: `'${input}' is not a valid hex` }
}

/**
 * Zod schema for validating hexadecimal strings.
 */
const zodHex = z.custom<Hex>(validateZodHex, zodHexError)

/**
 * Exports
 */
export { validateZodObject, zodAddress, zodAddressNonZero, zodHex }
