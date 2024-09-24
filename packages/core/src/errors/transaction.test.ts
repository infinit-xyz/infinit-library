import { name as coreName, version as coreVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { ContractNotFoundError, TransactionError, TxNotFoundError } from '@errors/index'

describe('TransactionError', () => {
  test('should match snapshot', () => {
    expect(new TransactionError('0x123')).toMatchInlineSnapshot(`
        [TransactionError: Transaction 0x123 reverted
        
        ${coreName}: ${coreVersion}]
    `)
  })
})

describe('ContractNotFoundError', () => {
  test('should match snapshot', () => {
    expect(new ContractNotFoundError('0x123', 'contractName')).toMatchInlineSnapshot(`
        [ContractNotFoundError: Contract contractName not found in 0x123
        
        ${coreName}: ${coreVersion}]
    `)
  })
})

describe('TxNotFoundError', () => {
  test('should match snapshot', () => {
    expect(new TxNotFoundError()).toMatchInlineSnapshot(`
        [TxNotFoundError: Transaction not found
        
        ${coreName}: ${coreVersion}]
    `)
  })
})
