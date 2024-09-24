import { SomeZodObject, ZodError } from 'zod'

import { ActionData } from '@base/action'

import { ValidateInputValueError } from '@errors/index'

const validateActionData = (data: ActionData, schema: SomeZodObject, signers: string[]) => {
  // validate signers
  for (const signer of signers) {
    if (!data.signer[signer]) {
      throw new ValidateInputValueError(`'${signer}' signer doesn't exist`)
    }
  }
  // validate params
  try {
    schema.parse(data.params)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidateInputValueError(error.message)
    }

    // other error
    throw error
  }
}

export { validateActionData }
