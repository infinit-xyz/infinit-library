import { SomeZodObject, ZodError } from 'zod'

import { ActionData } from '@base/action'

import { validateZodObject } from '@/utils/zod'
import { ValidateInputValueError } from '@errors/index'

const formatZodError = (error: ZodError): string => {
  return error.issues
    .map((issue, idx) => {
      // ['address', '0', 'test'] to 'address[0]["test"]'
      const path = issue.path.map((p, idx) => (idx === 0 ? p : typeof p === 'number' ? `[${p}]` : `["${p}"]`)).join('')

      return `${idx > 0 ? `\n` : ''}- Field: ${path}\n  Error: ${issue.message}`
    })
    .join(`\n`)
}

const validateActionData = (data: ActionData, schema: SomeZodObject, signers: string[]) => {
  // validate signers
  for (const signer of signers) {
    if (!data.signer[signer]) {
      throw new ValidateInputValueError(`'${signer}' signer doesn't exist`)
    }
  }
  // validate params
  validateZodObject(data.params, schema)
}

export { formatZodError, validateActionData }
