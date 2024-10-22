import { describe, expect, test, vi } from 'vitest'

import { OffChainActionCallback } from '@/types/callback/offChainAction'

import { OffChainAction, OffChainActionReturn } from './offChainAction'

// Mock implementation of OffChainAction for testing
class TestOffChainAction extends OffChainAction<{ param1: string }, { result: string }> {
  async run(_: { param1: string }, callback?: OffChainActionCallback): Promise<OffChainActionReturn<{ result: string }>> {
    if (callback) {
      await callback('start', { message: 'Action started' })
      await callback('progress', { current: 1, total: 2, message: 'Action in progress' })
      await callback('finish', { message: 'Action finished' })
    }
    return { message: 'Success', data: { result: 'Test result' } }
  }
}

describe('OffChainAction', () => {
  test('should create an instance of OffChainAction', () => {
    const action = new TestOffChainAction('TestAction')
    expect(action).toBeInstanceOf(OffChainAction)
    expect(action.name).toBe('TestAction')
  })

  test('should run the action and return the expected result', async () => {
    const action = new TestOffChainAction('TestAction')
    const result = await action.run({ param1: 'test' })
    expect(result).toEqual({ message: 'Success', data: { result: 'Test result' } })
  })

  test('should call the callback with the correct events', async () => {
    const action = new TestOffChainAction('TestAction')
    const callback = vi.fn()

    await action.run({ param1: 'test' }, callback)

    expect(callback).toHaveBeenCalledWith('start', { message: 'Action started' })
    expect(callback).toHaveBeenCalledWith('progress', { current: 1, total: 2, message: 'Action in progress' })
    expect(callback).toHaveBeenCalledWith('finish', { message: 'Action finished' })
  })
})
