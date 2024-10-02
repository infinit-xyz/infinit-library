import { ZodError } from 'zod'

export const MOCK_ZOD_ERROR = new ZodError([
  {
    code: 'custom',
    message: "'undefined' is not a valid address",
    fatal: true,
    path: ['address'],
  },
  {
    code: 'invalid_type',
    expected: 'bigint',
    received: 'undefined',
    path: ['decimals'],
    message: 'Required',
  },
  {
    code: 'invalid_type',
    expected: 'string',
    received: 'null',
    path: ['symbol'],
    message: 'Expected string, received null',
  },
  {
    code: 'invalid_type',
    expected: 'boolean',
    received: 'string',
    path: ['fakeList', 0, 'isFake'],
    message: 'Expected boolean, received string',
  },
])

const mockZodErrorUndefinedIssues = MOCK_ZOD_ERROR.issues.map((issue) => ({ ...issue }))
mockZodErrorUndefinedIssues[3].message = 'Required'

export const MOCK_ZOD_ERROR_UNDEFINED = new ZodError(mockZodErrorUndefinedIssues)
